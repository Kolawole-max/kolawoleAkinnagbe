<?php

	//https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_HLTX7gpMlk5QJSNbWr3jXyjewRlEFXn1ZYGd7bJV&currencies=BSN&base_currency=USD

	require_once 'CUrlLogic.php';

    $url='https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_HLTX7gpMlk5QJSNbWr3jXyjewRlEFXn1ZYGd7bJV&currencies=' . $_REQUEST['to'] . '&base_currency=' . $_REQUEST['from'];
    $decodeValue = 'data';

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
