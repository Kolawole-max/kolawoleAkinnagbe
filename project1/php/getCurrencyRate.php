<?php
//https://api.exchangeratesapi.io/v1/convert?access_key=5da14617d22bcbfc65f3a1d4866bca2b&from=GBP&to=JPY&amount=25

//https://api.exchangeratesapi.io/v1/latest?access_key=5da14617d22bcbfc65f3a1d4866bca2b&base=USD&symbols=GBP

	require_once 'CUrlLogic.php';

    $url='https://api.exchangeratesapi.io/v1/latest?access_key=5da14617d22bcbfc65f3a1d4866bca2b&base=' . $_REQUEST['from'] . '&symbols=' . $_REQUEST['to'];
    $decodeValue = 'rates';

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
