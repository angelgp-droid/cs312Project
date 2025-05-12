<?php
// File needs to be put in the root of your local html
//so that it can be accessed from https://cs.colostate.edu:4444/~EID/api.php
//if working in the angular console should output Server Response: Connection successful
//if not error will be output Http failure response for https://cs.colostate.edu:4444/~EID/api.php: 404 Not Found or similar 
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header("content-type: application/json");

$config = include('/s/chopin/n/under/gman0770/config/db_config.php');

$servername = $config['servername'];
$username = $config['username'];
$password = $config['password'];
$db = $config['db'];

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

//create colors table
$conn->query("
    CREATE TABLE IF NOT EXISTS colors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        hex VARCHAR(7) UNIQUE NOT NULL
    )
");

//insert default colors if table is empty
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

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        // Fetch colors
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
        // Add new color
        if (isset($data['name']) && isset($data['hex'])) {
            $name = trim($data['name']);
            $hex = trim($data['hex']);
            
            // Validate hex code format
            if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $hex)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid hex color code. Must be in format #RRGGBB."]);
                exit;
            }
            
            // Check if there's enough data
            if (empty($name) || empty($hex)) {
                http_response_code(400);
                echo json_encode(["message" => "Color name and hex value are required."]);
                exit;
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
                        if (strpos($error, "'name'") !== false) { // Check specific key name
                            http_response_code(409); // Conflict
                            echo json_encode(["message" => "Color name already exists."]);
                        } elseif (strpos($error, "'hex'") !== false) { // Check specific key name
                            http_response_code(409); // Conflict
                            echo json_encode(["message" => "Color hex value already exists."]);
                        } else {
                            http_response_code(409); // Conflict
                            echo json_encode(["message" => "Duplicate entry. Failed to add color."]);
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
        exit; // Exit after handling POST

    case 'PUT':
        // Edit existing color
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Color ID is required for an update."]);
            exit;
        }
        $id = intval($data['id']);
        $updates = [];
        $params = [];
        $types = "";

        if (isset($data['name'])) {
            $name = trim($data['name']);
            if (empty($name)) {
                http_response_code(400);
                echo json_encode(["message" => "Color name cannot be empty if provided for update."]);
                exit;
            }
            $updates[] = "name = ?";
            $params[] = $name;
            $types .= "s";
        }

        if (isset($data['hex'])) {
            $hex = trim($data['hex']);
            if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $hex)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid hex color code. Must be in format #RRGGBB."]);
                exit;
            }
            if (empty($hex)) {
                http_response_code(400);
                echo json_encode(["message" => "Color hex value cannot be empty if provided for update."]);
                exit;
            }
            $updates[] = "hex = ?";
            $params[] = $hex;
            $types .= "s";
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(["message" => "No fields provided for update. Please provide name and/or hex value."]);
            exit;
        }

        $params[] = $id;
        $types .= "i";
        $sql = "UPDATE colors SET " . implode(", ", $updates) . " WHERE id = ?";
        
        try {
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $result = $stmt->execute();

            if ($result) {
                if ($stmt->affected_rows > 0) {
                    echo json_encode(["message" => "Color updated successfully."]);
                } else {
                    // Check if the color ID exists
                    $checkStmt = $conn->prepare("SELECT id FROM colors WHERE id = ?");
                    $checkStmt->bind_param("i", $id);
                    $checkStmt->execute();
                    $checkResult = $checkStmt->get_result();
                    if ($checkResult->num_rows === 0) {
                        http_response_code(404);
                        echo json_encode(["message" => "Color not found."]);
                    } else {
                         // Data provided was the same as existing data
                        echo json_encode(["message" => "No changes detected for the color."]);
                    }
                    $checkStmt->close();
                }
            } else {
                $error = $conn->error;
                 if (strpos($error, 'Duplicate entry') !== false) {
                    if (strpos($error, "'name'") !== false) {
                        http_response_code(409);
                        echo json_encode(["message" => "Update failed: Color name already exists."]);
                    } elseif (strpos($error, "'hex'") !== false) {
                        http_response_code(409);
                        echo json_encode(["message" => "Update failed: Color hex value already exists."]);
                    } else {
                        http_response_code(409);
                        echo json_encode(["message" => "Update failed: Duplicate entry."]);
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Failed to update color: " . $error]);
                }
            }
            $stmt->close();
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update color: " . $e->getMessage()]);
        }
        exit; // Exit after handling PUT

    case 'DELETE':
        // Delete color
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Color ID is required for deletion."]);
            exit;
        }
        $id = intval($data['id']);

        // Check if there are less than 2 colors
        $countResult = $conn->query("SELECT COUNT(*) AS count FROM colors");
        $countRow = $countResult->fetch_assoc();
        if ($countRow['count'] <= 2) {
            http_response_code(400);
            echo json_encode(["message" => "Cannot delete color. At least two colors must remain in the table."]);
            exit;
        }

        try {
            $stmt = $conn->prepare("DELETE FROM colors WHERE id = ?");
            $stmt->bind_param("i", $id);
            $result = $stmt->execute();

            if ($result) {
                if ($stmt->affected_rows > 0) {
                    echo json_encode(["message" => "Color deleted successfully."]);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "Color not found or already deleted."]);
                }
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to delete color: " . $conn->error]);
            }
            $stmt->close();
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to delete color: " . $e->getMessage()]);
        }
        exit; // Exit after handling DELETE
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "Method not supported."]);
        exit;
}


//json object
echo json_encode([
    "message" => "Connection successful",
    "colors" => $colors
]);

$conn->close();