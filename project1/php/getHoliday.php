<?php
//https://date.nager.at/api/v3/PublicHolidays/2023/gb


	require_once 'CUrlLogic.php';
	
	// $_REQUEST['year'] = 2023;
	// $_REQUEST['iso'] = 'ng';

    $decodeValue = null;
    $url='https://date.nager.at/api/v3/PublicHolidays/' . $_REQUEST['year'] . '/' . $_REQUEST['iso'];
	

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
