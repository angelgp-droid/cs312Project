<?php
// File needs to be put in the root of your local html
//so that it can be accessed from https://cs.colostate.edu:4444/~EID/api.php
//if working in the angular console should output Server Response: Connection successful
//if not error will be output Http failure response for https://cs.colostate.edu:4444/~EID/api.php: 404 Not Found or similar 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
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

//fetch colors
$colors = [];
$result = $conn->query("SELECT name, hex FROM colors ORDER BY name ASC");
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $colors[] = [
            "name" => $row['name'],
            "hex" => $row['hex']
        ];
    }
}

//json object
echo json_encode([
    "message" => "Connection successful",
    "colors" => $colors
]);

$conn->close();