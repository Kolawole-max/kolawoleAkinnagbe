<?php
	$countryBoundaries = "../libs/countryBorders/countryBorders.geo.json";
	
	$geojsonString = file_get_contents($countryBoundaries);

	$geojsonObject = json_decode($geojsonString);

	$countryInfo = null;
	foreach($geojsonObject->features as $key){
		if($key->properties->iso_a2 == $_REQUEST['iso']){
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