<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header("content-type: application/json");

$servername = "faure";
$username = "";       
$password = "";    
$db = "";               

$conn = new mysqli($servername, $username, $password, $db);

$defaultColors = [
    ['black', '#000000'],
    ['blue', '#0000ff'],
    ['brown', '#a52a2a'],
    ['green', '#008000'],
    ['orange', '#ffa500'],
    ['pink', '#ffc0cb'],
    ['purple', '#800080'],
    ['red', '#ff0000'],
    ['teal', '#008080'],
    ['yellow', '#ffff00']
];

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Connection failed: " . $conn->connect_error]);
    exit;
}

$conn->query("
    CREATE TABLE IF NOT EXISTS colors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        hex VARCHAR(7) UNIQUE NOT NULL
    )
");

$result = $conn->query("SELECT COUNT(*) AS count FROM colors");
$row = $result->fetch_assoc();
if ($row['count'] == 0) {
    $stmt = $conn->prepare("INSERT INTO colors (name, hex) VALUES (?, ?)");
    foreach ($defaultColors as [$name, $hex]) {
        $stmt->bind_param("ss", $name, $hex);
        $stmt->execute();
    }
    $stmt->close();
}

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        $colors = [];
        $result = $conn->query("SELECT id, name, hex FROM colors ORDER BY name ASC");
        while ($row = $result->fetch_assoc()) {
            $colors[] = $row;
        }
        echo json_encode(["message" => "Fetched colors", "colors" => $colors]);
        break;

    case 'POST':
        if (isset($data['name']) && isset($data['hex'])) {
            $name = trim($data['name']);
            $hex = trim($data['hex']);

            if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $hex)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid hex color code."]);
                break;
            }

            $stmt = $conn->prepare("INSERT INTO colors (name, hex) VALUES (?, ?)");
            $stmt->bind_param("ss", $name, $hex);
            $result = $stmt->execute();

            if ($result) {
                echo json_encode(["message" => "Color added", "id" => $conn->insert_id]);
            } else {
                if (strpos($conn->error, 'Duplicate') !== false) {
                    echo json_encode(["message" => "Color name or hex value already exists."]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Error: " . $conn->error]);
                }
            }
            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Missing name or hex value."]);
        }
        break;

    case 'PUT':
        if (isset($data['id'], $data['name'], $data['hex'])) {
            $id = intval($data['id']);
            $name = trim($data['name']);
            $hex = trim($data['hex']);

            if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $hex)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid hex color code."]);
                break;
            }

            $check = $conn->prepare("SELECT id FROM colors WHERE (name = ? OR hex = ?) AND id != ?");
            $check->bind_param("ssi", $name, $hex, $id);
            $check->execute();
            $check->store_result();

            if ($check->num_rows > 0) {
                echo json_encode(["message" => "Color name or hex value already exists."]);
                break;
            }

            $stmt = $conn->prepare("UPDATE colors SET name = ?, hex = ? WHERE id = ?");
            $stmt->bind_param("ssi", $name, $hex, $id);
            $stmt->execute();

            if ($stmt->affected_rows >= 0) {
                echo json_encode(["message" => "Color updated."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to update color."]);
            }

            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Missing id, name, or hex value."]);
        }
        break;

    case 'DELETE':
        if (isset($data['id'])) {
            $id = intval($data['id']);
            $countResult = $conn->query("SELECT COUNT(*) AS count FROM colors");
            $countRow = $countResult->fetch_assoc();

            if ($countRow['count'] <= 2) {
                echo json_encode(["message" => "Cannot delete color. At least two colors must remain."]);
                break;
            }

            $stmt = $conn->prepare("DELETE FROM colors WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                echo json_encode(["message" => "Color deleted."]);
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Color not found or already deleted."]);
            }

            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Missing color id for deletion."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}

$conn->close();
