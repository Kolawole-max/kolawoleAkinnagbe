<?php
    class CUrlLogic {
        public function getResult($url, $decordValue){
            ini_set('display_errors', 'On');
            error_reporting(E_ALL);

            $executionStartTime = microtime(true);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_URL,$url);

            $result=curl_exec($ch);

            curl_close($ch);

            $decode = json_decode($result,true);	

            $output['status']['code'] = "200";
            $output['status']['name'] = "ok";
            $output['status']['description'] = "success";
            $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
            if($decordValue === null){
                $output['data'] = $decode;
            }else if(is_string($decordValue)){
                $output['data'] = $decode[$decordValue];
            } else {
                $output['data'] = array();
                foreach ($decode as $key => $value) {
                    $output['data'][$key] = $value;
                }
                
            }
            
            header('Content-Type: application/json; charset=UTF-8');
            return $output;
        }
    }
?>