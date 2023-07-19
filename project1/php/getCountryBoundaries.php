<?php
	$countryBoundaries = "../libs/countryBorders/countryBorders.geo.json";

	$countryName = $_REQUEST['countryName'];
		
	// Read the GeoJSON file
	$geojsonString = file_get_contents($countryBoundaries);

	// Decode the GeoJSON data
	$geojsonObject = json_decode($geojsonString);

	// Get the 'name' property value
	$countryInfo = null;
	foreach($geojsonObject->features as $key){
		if($key->properties->name == $countryName){
			$countryInfo = $key;
		}
		
	}
	

	// Encode the result as JSON
	$response = json_encode(['data' => $countryInfo]);

	// Set the response header
	header('Content-Type: application/json');

	// Output the result
	echo $response;
?>