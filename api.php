<?php
// File needs to be put in the root of your local html
//so that it can be accessed from https://cs.colostate.edu:4444/~EID/api.php
//if working in the angular console should output Server Response: Connection successful
//if not error will be output Http failure response for https://cs.colostate.edu:4444/~EID/api.php: 404 Not Found or similar 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header("content-type: application/json");
$servername = "faure";
$username = "";
$db = "";
$password = "";
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
        hex VARCHAR(7) NOT NULL
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
                break;
            }
            
            // Check if there's enough data
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

    case 'PUT':
    //TODO: Edit existing color (interface two)
    case 'DELETE':
    //TODO: Delete color (interface three)


//json object
echo json_encode([
    "message" => "Connection successful",
    "colors" => $colors
]);

$conn->close();
}