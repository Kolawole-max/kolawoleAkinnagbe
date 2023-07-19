<?php

	$countryBoundaries = "../libs/countryBorders/countryBorders.geo.json";
		
	// Read the GeoJSON file
	$geojsonString = file_get_contents($countryBoundaries);

	// Decode the GeoJSON data
	$geojsonObject = json_decode($geojsonString);

	// Iterate over features and properties
    $countryName = [];
    foreach ($geojsonObject->features as $feature) {
        $countryName[] = $feature->properties;
    }

	// Encode the result as JSON
	$response = json_encode(['data' => $countryName]);

	// Set the response header
	header('Content-Type: application/json');

	// Output the result
	echo $response;
?>

