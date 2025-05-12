<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$servername = "faure";
$username = "c837205363";
$password = "";
$db = "c837205363";

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
    echo json_encode([
        "message" => "Connection failed: " . $conn->connect_error,
        "colors" => []
    ]);
    exit;
}

// Create table if not exists
$conn->query("
    CREATE TABLE IF NOT EXISTS colors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        hex VARCHAR(7) NOT NULL
    )
");

// Insert default colors if table is empty
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
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $colors[] = [
                    "id" => $row['id'],
                    "name" => $row['name'],
                    "hex" => $row['hex']
                ];
            }
        }

        echo json_encode([
            "message" => "Connection successful",
            "colors" => $colors
        ]);
        break;

    case 'POST':
        // Simulate DELETE
        if (isset($data['action']) && $data['action'] === 'delete') {
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
        }

        // Add new color
        if (isset($data['name']) && isset($data['hex'])) {
            $name = trim($data['name']);
            $hex = trim($data['hex']);

            if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $hex)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid hex color code. Must be in format #RRGGBB."]);
                break;
            }

            if (empty($name) || empty($hex)) {
                http_response_code(400);
                echo json_encode(["message" => "Color name and hex value are required."]);
                break;
            }

            try {
                $stmt = $conn->prepare("INSERT INTO colors (name, hex) VALUES (?, ?)");
                $stmt->bind_param("ss", $name, $hex);
                $result = $stmt->execute();

                if ($result) {
                    echo json_encode([
                        "message" => "Color added successfully",
                        "id" => $conn->insert_id,
                        "name" => $name,
                        "hex" => $hex
                    ]);
                } else {
                    $error = $conn->error;
                    if (strpos($error, 'Duplicate entry') !== false) {
                        if (strpos($error, 'name') !== false) {
                            echo json_encode(["message" => "Color name already exists."]);
                        } else {
                            echo json_encode(["message" => "Color hex value already exists."]);
                        }
                    } else {
                        http_response_code(500);
                        echo json_encode(["message" => "Failed to add color: " . $error]);
                    }
                }

                $stmt->close();
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["message" => "Failed to add color: " . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Color name and hex value are required."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}

$conn->close();
