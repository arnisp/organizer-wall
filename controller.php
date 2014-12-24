<?php
/**
 * controller.php
 * Version: 1.0.0
 *
 * Project OrganizerWall
 *
 * Copyright, 2014, Arnis Puskeiris (arnisp, apbyte, arnico)
 * Released under MIT License.
 *
 * License: http://opensource.org/licenses/MIT
 * Website: http://organizerwall.arnisp.com/
 * Github: https://github.com/arnisp/organizer-wall
 */

error_reporting(0);

class Controller
{

    // Set controller vars
    private $params;
    private $action;

    private $output;

    // Register controller actions. Respond only to these.
    private $allowActions = array("listWalls", "listBoards", "listLists", "listCards", "listDescriptions", "listChecklists",
        "orderLists", "orderCards", "orderCheckboxes",
        "buildWall", "buildBoard", "buildList", "buildCard", "buildCheckbox",
        "editList", "editCard", "editCheckbox",
        "deleteCheckbox", "removeChecklist", "removeDescription", "deleteCard", "deleteList",
        "setLabel", "setDescription", "setChecklist",
        "openWall");

    // Set wall vars
    private $openwall;
    private $index;
    private $wall;
    private $lists;
    private $cards;
    private $descriptions;
    private $checklists;

    public function __construct($params) {
        $this->params = $params;
        $this->action = $this->params['action'];
    }

    // Set output status
    private function setError() {
        // application error, don't give info to public
        $this->output = "";
        $this->output['error'] = true;
    }

    private function setFailed() {
        $this->output['status'] = false;
    }

    private function setDone() {
        $this->output['status'] = true;
    }

    // Utilities
    private function encryptPassword() {
        $this->params['pass'] = md5($this->params['pass']);
    }

    private function createWallFileId() {
        $string = $this->params['title'];
        $string = strtolower($string);
        $match= array("/\s\&\s/", "/[\s\+]+/", "/[^a-z0-9\-\&]/ui");
        $replace = array("and","-","-");
        $string = preg_replace($match,$replace, $string);
        $this->params['file'] = $string;
    }

    // Security methods
    private function checkLogin() {
        $this->encryptPassword();
        if (($this->readIndex()) AND ($this->params['wall']) AND ($this->params['pass'])) {
            foreach ( $this->index->walls as $walldata ) {
                if ($walldata->file == $this->params['wall']) {
                    if ($walldata->pass == $this->params['pass']) {
                        $this->openwall = $walldata;
                        unset($this->openwall->pass);
                        unset($this->openwall->file);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // App main methods
    private function readIndex() {
        if (file_exists("storage/_walls.json")) {
            $json_store = file_get_contents("storage/_walls.json");
            $this->index = json_decode($json_store);
            return true;
        } else {
            return false;
        }
    }

    private function writeIndex() {
        $json_store = json_encode($this->index);
        file_put_contents("storage/_walls.json",$json_store);
    }

    // Wall methods
    private function readWall() {
        if (file_exists("storage/".$this->params['wall'].".json")) {
            $json_store = file_get_contents("storage/".$this->params['wall'].".json");
            $this->wall = json_decode($json_store);
            return true;
        } else {
            return false;
        }
    }

    private function writeWall() {
        $json_store = json_encode($this->wall);
        file_put_contents("storage/".$this->params['wall'].".json",$json_store);
    }

    // List methods
    private function readLists() {
        if (file_exists("storage/".$this->params['wall']."_lists.json")) {
            $json_store = file_get_contents("storage/".$this->params['wall']."_lists.json");
            $this->lists = json_decode($json_store);
            return true;
        } else {
            return false;
        }
    }

    private function writeLists() {
        $json_store = json_encode($this->lists);
        file_put_contents("storage/".$this->params['wall']."_lists.json",$json_store);
    }

    // Card methods
    private function readCards() {
        if (file_exists("storage/".$this->params['wall']."_cards.json")) {
            $json_store = file_get_contents("storage/".$this->params['wall']."_cards.json");
            $this->cards = json_decode($json_store);
            return true;
        } else {
            return false;
        }
    }

    private function writeCards() {
        $json_store = json_encode($this->cards);
        file_put_contents("storage/".$this->params['wall']."_cards.json",$json_store);
    }

    // Card description methods
    private function readDescriptions() {
        if (file_exists("storage/".$this->params['wall']."_descriptions.json")) {
            $json_store = file_get_contents("storage/".$this->params['wall']."_descriptions.json");
            $this->descriptions = json_decode($json_store);
            return true;
        } else {
            return false;
        }
    }

    private function writeDescriptions() {
        $json_store = json_encode($this->descriptions);
        file_put_contents("storage/".$this->params['wall']."_descriptions.json",$json_store);
    }

    // Card checklist methods
    private function readChecklists() {
        if (file_exists("storage/".$this->params['wall']."_checklists.json")) {
            $json_store = file_get_contents("storage/".$this->params['wall']."_checklists.json");
            $this->checklists = json_decode($json_store);
            return true;
        } else {
            return false;
        }
    }

    private function writeChecklists() {
        $json_store = json_encode($this->checklists);
        file_put_contents("storage/".$this->params['wall']."_checklists.json",$json_store);
    }

    // Main call processor
    public function process() {
        if (in_array($this->action, $this->allowActions)) {
            if (($this->action != "listWalls") AND ($this->action != "buildWall")) {
                //other actions need password check
                if ($this->checkLogin()) {
                    $this->{$this->action}();
                } else {
                    $this->setError();
                }
            } else {
                $this->{$this->action}();
            }
        } else {
            $this->setError();
        }
    }

    // Send output
    public function output() {
        echo json_encode($this->output);
    }

    // Set current opened wall
    public function openWall() {
        $this->output = $this->openwall;
    }

    // List Actions
    public function listWalls() {
        $walls = null;
        if (($this->readIndex()) AND (count($this->index->walls) > 0)) {
            //produce new array without passwords
            foreach ( $this->index->walls as $key=>$walldata ) {
                unset($walldata->pass);
                $walls->walls[$key] = $walldata;
            }
            $this->output = $walls;
        } else {
            $this->setFailed();
        }
    }

    public function listBoards() {
        if (($this->readWall()) AND (count($this->wall->boards) > 0)) {
            $this->output = $this->wall;
        } else {
            $this->setFailed();
        }
    }

    public function listLists() {
        if (($this->readLists()) AND (count($this->lists->lists) > 0)) {
            $this->output = $this->lists;
        } else {
            $this->setFailed();
        }
    }

    public function listCards() {
        if (($this->readCards()) AND (count($this->cards->cards) > 0)) {
            $this->output = $this->cards;
        } else {
            $this->setFailed();
        }
    }

    public function listDescriptions() {
        if (($this->readDescriptions()) AND (count($this->descriptions) > 0)) {
            $this->output = $this->descriptions;
        } else {
            $this->setFailed();
        }
    }

    public function listCheckLists() {
        if (($this->readChecklists()) AND (count($this->checklists) > 0)) {
            $this->output = $this->checklists;
        } else {
            $this->setFailed();
        }
    }

    // Creating actions
    public function buildWall() {
        if ((!$this->params['title']) OR (!$this->params['pass'])) {
            $this->setFailed();
            return false;
        }
        $this->createWallFileId();
        $this->encryptPassword();

        $store['title'] = $this->params['title'];
        $store['file'] = $this->params['file'];
        $store['pass'] = $this->params['pass'];

        $this->readIndex();
        $this->index->walls[] = $store;
        $this->writeIndex();
        
        $this->setDone();
        $this->output['file'] = $store['file'];
        return true;
    }

    public function buildBoard() {
        if (!$this->params['id']) {
            $this->setFailed();
            return false;
        }

        $store['id'] = $this->params['id'];

        if ($this->readWall()) {
            $store['order'] = count($this->wall->boards)+1;
        } else {
            $store['order'] = 1;
        }

        $this->wall->boards[] = $store;
        $this->writeWall();

        $this->setDone();
        return true;
    }

    public function buildList() {
        if ((!$this->params['id']) OR (!$this->params['board']) OR (!$this->params['title']) OR (!$this->params['order'])) {
            $this->setFailed();
            return false;
        }
        $store['id'] = $this->params['id'];
        $store['board'] = $this->params['board'];
        $store['title'] = $this->params['title'];
        $store['order'] = (int)$this->params['order'];

        $this->readLists();
        foreach ($this->lists->lists as $key => $value) {
                $this->lists->lists[$key]->order = $this->lists->lists[$key]->order+1;
        }
        $this->lists->lists[] = $store;
        $this->writeLists();

        $this->setDone();
        return true;
    }

    public function buildCard() {
        if ((!$this->params['id']) OR (!$this->params['list']) OR (!$this->params['content']) OR (!$this->params['order'])) {
            $this->setFailed();
            return false;
        }
        $store['id'] = $this->params['id'];
        $store['list'] = $this->params['list'];
        $store['content'] = $this->params['content'];
        $store['order'] = (int)$this->params['order'];

        $this->readCards();
        $this->cards->cards[] = $store;
        $this->writeCards();

        $this->setDone();
        return true;
    }

    public function buildCheckbox() {
        if ((!$this->params['id']) OR (!$this->params['card']) OR (!$this->params['content']) OR (!$this->params['order'])) {
            $this->setFailed();
            return false;
        }

        $store['id'] = $this->params['id'];
        $store['checked'] = 0;
        $store['card'] = $this->params['card'];
        $store['content'] = $this->params['content'];
        $store['order'] = (int)$this->params['order'];

        $this->readChecklists();
        $this->checklists->{$this->params['card']}[] = $store;

        $this->writeChecklists();

        $this->setDone();
        return true;
    }

    // Editing actions
    public function editList() {
        if ((!$this->params['id']) OR (!$this->params['title'])) {
            $this->setFailed();
            return false;
        }
        $this->readLists();
        foreach ($this->lists->lists as $key => $value) {
            if ($value->id == $this->params['id']) {
                $this->lists->lists[$key]->title = $this->params['title'];
            }
        }
        $this->writeLists();

        $this->setDone();
        return true;
    }

    public function editCard() {
        if ((!$this->params['id']) OR (!$this->params['content'])) {
            $this->setFailed();
            return false;
        }
        $this->readCards();

        foreach ($this->cards->cards as $key => $value) {
            if ($value->id == $this->params['id']) {
                $this->cards->cards[$key]->content = $this->params['content'];
            }
        }
        $this->writeCards();

        $this->setDone();
        return true;
    }

    public function editCheckbox() {
        if ((!$this->params['id']) OR (!$this->params['card'])) {
            $this->setFailed();
            return false;
        }
        $this->readChecklists();

        foreach ($this->checklists->{$this->params['card']} as $key => $value) {
            if ($value->id == $this->params['id']) {
                if ($this->params['content']) {
                    $this->checklists->{$this->params['card']}[$key]->content = $this->params['content'];
                }
                if ($this->params['checked'] != "") {
                    $this->checklists->{$this->params['card']}[$key]->checked = (boolean)$this->params['checked'];
                }
            }
        }

        $this->writeChecklists();

        $this->setDone();
        return true;
    }

    // Deleting actions
    public function deleteList() {
        if ((!$this->params['id']) OR (!$this->params['board'])) {
            $this->setFailed();
            return false;
        }
        if (!$this->readLists()) {
            $this->setFailed();
            return false;
        }

        foreach ($this->lists->lists as $key => $value) {
            if ($value->id == $this->params['id']) {
                array_splice($this->lists->lists, $key, 1);
            }
        }

        $this->writeLists();

        $this->orderLists();
        if ($this->readCards()) {
            $offsetcorrection = 0;
            $deletecards = Array();
            foreach ($this->cards->cards as $key => $value) {
                if ($value->list == $this->params['id']) {
                    $deletecards[] = $value->id;
                    array_splice($this->cards->cards, ($key-$offsetcorrection), 1);
                    $offsetcorrection++;
                }
            }
            if(count($deletecards) > 0 ){
                if ($this->readDescriptions()) {
                    foreach ($deletecards as $keyc => $valuec) {
                        unset($this->descriptions->{$valuec});
                    }
                    $this->writeDescriptions();
                }
                if ($this->readChecklists()) {
                    foreach ($deletecards as $keyc => $valuec) {
                        unset($this->checklists->{$valuec});
                    }
                    $this->writeChecklists();
                }
            }

            $this->writeCards();
        }

        $this->setDone();
        return true;
    }

    public function deleteCard() {
        if ((!$this->params['id']) OR (!$this->params['list'])) {
            $this->setFailed();
            return false;
        }
        if (!$this->readCards()) {
            $this->setFailed();
            return false;
        }
        
        foreach ($this->cards->cards as $key => $value) {
            if ($value->id == $this->params['id']) {
                    array_splice($this->cards->cards, $key, 1);
            }
        }
        
        $this->writeCards();

        $this->params['card'] = $this->params['id'];

        $this->orderCards();
        $this->removeDescription();
        $this->removeChecklist();

        $this->setDone();
        return true;
    }

    public function removeDescription() {
        if (!$this->params['card']) {
            $this->setFailed();
            return false;
        }
        if (!$this->readDescriptions()) {
            $this->setFailed();
            return false;
        }

        unset($this->descriptions->{$this->params['card']});

        $this->writeDescriptions();

        $this->setDone();
        return true;
    }

    public function removeChecklist() {
        if (!$this->params['card']) {
            $this->setFailed();
            return false;
        }
        if (!$this->readChecklists()) {
            $this->setFailed();
            return false;
        }
        
        unset($this->checklists->{$this->params['card']});

        $this->writeChecklists();

        $this->setDone();
        return true;
    }

    public function deleteCheckbox() {
        if ((!$this->params['order']) OR (!$this->params['card']) OR (!$this->params['id'])) {
            $this->setFailed();
            return false;
        }
        if (!$this->readChecklists()) {
            $this->setFailed();
            return false;
        }

        $ordered = explode(',',$this->params['order']);
        $orderedid = Array();
        $order = 1;
        foreach ($ordered as $value) {
            $orderedid[substr($value,9)] = $order;
            $order++;
        }

        foreach ($this->checklists->{$this->params['card']} as $key => $value) {
            if ($value->id == $this->params['id']) {
                array_splice($this->checklists->{$this->params['card']}, $key, 1);
            }
        }
        foreach ($this->checklists->{$this->params['card']} as $key => $value) {
            $this->checklists->{$this->params['card']}[$key]->order = (int)$orderedid[$value->id];
        }
        
        $this->writeChecklists();
        $this->orderCheckboxes();

        $this->setDone();
        return true;
    }

    // Ordering actions
    public function orderLists() {
        if ((!$this->params['order']) OR (!$this->params['board'])) {
            $this->setFailed();
            return false;
        }
        if (!$this->readLists()) {
            $this->setFailed();
            return false;
        }

        $ordered = explode(',',$this->params['order']);
        $orderedid = Array();
        $order = 1;
        foreach ($ordered as $value) {
            $orderedid[$value] = $order;
            $order++;
        }
        
        foreach ($this->lists->lists as $key => $value) {
            if ($orderedid[$value->id]) {
                $this->lists->lists[$key]->order = (int)$orderedid[$value->id];
                $this->lists->lists[$key]->board = $this->params['board'];
            }
        }
        $this->writeLists();

        $this->setDone();
        return true;
    }

    public function orderCards() {
        if ((!$this->params['order']) OR (!$this->params['list'])) {
            $this->setFailed();
            return false;
        }
        if (!$this->readCards()) {
            $this->setFailed();
            return false;
        }

        $ordered = explode(',',$this->params['order']);
        $orderedid = Array();
        $order = 1;
        foreach ($ordered as $value) {
            $orderedid[$value] = $order;
            $order++;
        }
        
        foreach ($this->cards->cards as $key => $value) {
            if ($orderedid[$value->id]) {
                $this->cards->cards[$key]->order = (int)$orderedid[$value->id];
                $this->cards->cards[$key]->list = $this->params['list'];
            }
        }

        $this->writeCards();

        $this->setDone();
        return true;
    }

    public function orderCheckboxes() {
        if ((!$this->params['order']) OR (!$this->params['card'])) {
            $this->setFailed();
            return false;
        }
        if (!$this->readChecklists()) {
            $this->setFailed();
            return false;
        }

        $ordered = explode(',',$this->params['order']);
        $orderedid = Array();
        $order = 1;
        foreach ($ordered as $value) {
            $orderedid[$value] = $order;
            $order++;
        }
        
        foreach ($this->checklists->{$this->params['card']} as $key => $value) {
            if ($orderedid[$value->id]) {
                $this->checklists->{$this->params['card']}[$key]->order = (int)$orderedid[$value->id];
                $this->checklists->{$this->params['card']}[$key]->card = $this->params['card'];
            }
        }

        $this->writeChecklists();

        $this->setDone();
        return true;
    }

    // State change actions
    public function setLabel() {
        
        if ((!$this->params['card'])) {
            $this->setFailed();
            return false;
        }
        $this->readCards();

        foreach ($this->cards->cards as $key => $value) {
            if ($value->id == $this->params['card']) {
                $this->cards->cards[$key]->label = $this->params['label'];
            }
        }
        $this->writeCards();

        $this->setDone();
        return true;
    }

    public function setDescription() {
        if ((!$this->params['card']) OR (!$this->params['content'])) {
            $this->setFailed();
            return false;
        }
        $this->readDescriptions();
        $this->descriptions->{$this->params['card']} = $this->params['content'];

        $this->writeDescriptions();

        $this->setDone();
        return true;
    }

    public function setChecklist() {
        if (!$this->params['card']) {
            $this->setFailed();
            return false;
        }
        $this->readChecklists();
        $this->checklists->{$this->params['card']} = "";

        $this->writeChecklists();

        $this->setDone();
        return true;
    }

}

$controller = new Controller($_POST);
$controller->process();
$controller->output();

?>