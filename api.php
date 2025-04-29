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


// Check connection
if ($conn->connect_error) {
	http_response_code(400);
    die("Connection failed: " . $conn->connect_error);
    echo json_encode(["message" => "Connection failed: "]);
}
else {
    http_response_code(200);
    echo json_encode(["message" => "Connection successful"]);
}