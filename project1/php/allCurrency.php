<?php

	//https://api.freecurrencyapi.com/v1/currencies?apikey=fca_live_HLTX7gpMlk5QJSNbWr3jXyjewRlEFXn1ZYGd7bJV&currencies=EUR

	//https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_HLTX7gpMlk5QJSNbWr3jXyjewRlEFXn1ZYGd7bJV&currencies=EUR

	require_once 'CUrlLogic.php';

	$decodeValue = 'data';

	if(isset($_REQUEST['code'])){
		$url='https://api.freecurrencyapi.com/v1/currencies?apikey=fca_live_HLTX7gpMlk5QJSNbWr3jXyjewRlEFXn1ZYGd7bJV&currencies=' . $_REQUEST['code'];
	} else {
		$url='https://api.freecurrencyapi.com/v1/currencies?apikey=fca_live_HLTX7gpMlk5QJSNbWr3jXyjewRlEFXn1ZYGd7bJV&currencies=';
	}
    

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
