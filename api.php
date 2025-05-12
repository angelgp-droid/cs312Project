<?php
// CORS headers
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header("Content-Type: application/json");

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$config = include('/s/chopin/n/under/gman0770/config/db_config.php');

$servername = $config['servername'];
$username = $config['username'];
$password = $config['password'];
$db = $config['db'];

$conn = new mysqli($servername, $username, $password, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle HTTP methods
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
    // Fetch all colors
    $result = $conn->query("SELECT id, name, hex FROM colors ORDER BY name ASC");
    if ($result) {
        $colors = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode(["colors" => $colors]);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(["error" => "Failed to fetch colors from the database: " . $conn->error]);
    }
    break;

    case 'POST':
        // Add a new color
        $name = trim($data['name']);
        $hex = trim($data['hex']);

        if (empty($name) || empty($hex) || !preg_match('/^#[0-9A-Fa-f]{6}$/', $hex)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid input."]);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO colors (name, hex) VALUES (?, ?)");
        $stmt->bind_param("ss", $name, $hex);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Color added successfully."]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Color name or hex value already exists."]);
        }
        $stmt->close();
        break;

    case 'PUT':
        // Edit an existing color
        $id = intval($data['id']);
        $name = trim($data['name']);
        $hex = trim($data['hex']);

        if (empty($id) || (empty($name) && empty($hex))) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid input."]);
            exit;
        }

        $updates = [];
        $params = [];
        $types = "";

        if (!empty($name)) {
            $updates[] = "name = ?";
            $params[] = $name;
            $types .= "s";
        }

        if (!empty($hex)) {
            if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $hex)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid hex value."]);
                exit;
            }
            $updates[] = "hex = ?";
            $params[] = $hex;
            $types .= "s";
        }

        $params[] = $id;
        $types .= "i";

        $sql = "UPDATE colors SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Color updated successfully."]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Error updating color."]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        // Delete a color
        $id = intval($_GET['id'] ?? 0);

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid ID."]);
            exit;
        }

        $countResult = $conn->query("SELECT COUNT(*) AS count FROM colors");
        $countRow = $countResult->fetch_assoc();

        if ($countRow['count'] <= 2) {
            http_response_code(400);
            echo json_encode(["message" => "Cannot delete. At least 2 colors must remain."]);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM colors WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Color deleted successfully."]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Error deleting color."]);
        }
        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}

$conn->close();