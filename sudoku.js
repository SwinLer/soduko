var clock = new TimeClock;
var gameField = document.getElementById("game-field");
var gameDifficuty = Game.DifficutyEasy;
var usrInputs = new Array();
var game;

//刷新游戏表格
function updateGameTable(){
    clock.stop();
    let gtable = document.getElementById("game-table");
    let tr,td,value,input;

    if(gtable){
        gtable.remove();
    }
    gtable = document.createElement("table");
    gtable.setAttribute("align", "center");
    gtable.setAttribute("id", "game-table");
    gtable.setAttribute("class", "game-table");
    
    game = new Game(gameDifficuty);

    //填充表格元素
    for(let i = 0; i < 9; i++){
        tr = document.createElement("tr");
        for( let j = 0; j < 9; j++){
            td = document.createElement("td");
            value = game.getValue(new Number(i), new Number(j));
            td.setAttribute("class", "td-cell")

            if(value){
                td.innerHTML = value;
            }else{
                input = document.createElement("input");
                usrInputs.push(input);
                input.setAttribute("id", `cell-${i}-${j}`);
                input.setAttribute("class", "cell-input");
                input.setAttribute("type", "text");
                input.setAttribute("onkeyup", "fillCell(this)");
                td.appendChild(input);
            }
            tr.appendChild(td);
        }
        gtable.appendChild(tr);
    }
    gameField.appendChild(gtable);
}

//填充表格单位元素
function fillCell(c){
    let value = new Number(c.value);
    let cellId = c.id;
    let rowNum = cellId.indexOf('-') + 1;
    let row = new Number(cellId.substr(rowNum, 1));
    let colNum = cellId.indexOf('-',rowNum) + 1;
    let col = new Number(cellId.substr(colNum, 1));

    let alertField = document.getElementById("alert-field");
    alertField.innerHTML = "";

    //判断非法输入
    if( isNaN(value) || value < 1 || value > 9 ){
        c.value = "";
        value = "";
    }

    //冲突检测判断是否有重复值
    if(!game.table.isDistinct( {row:row, col:col, num:value} )){
        let alertField = document.getElementById("alert-field");
        alertField.innerHTML = "repeatedly input!";
        alertField.setAttribute("class", "game-repeat");
        //c.value="";
        //value="";
    }

    game.table.setValueAt(row, col, value);

    //表格填完判断是否正确
    if(checkInputs()){
        let alertField = document.getElementById("alert-field");
        let timeTip = document.getElementById("time-tip");
        let tableValid = game.table.isValid(true);
        //console.log("complete")
        if(tableValid){
            alertField.innerHTML = `Success! time used: ${timeTip.innerHTML}`;
            alertField.setAttribute("class", "game-success");
            clock.stop();
        }else{
            alertField.innerHTML = `Game Fail. time used: ${timeTip.innerHTML}`;
            alertField.setAttribute("class", "game-fail");
            clock.stop();
        }
    }
}

//判断表格是否填完
function checkInputs(){
    let valid = true;
    usrInputs.forEach( e => {
        if( !e.value ){
            valid = false;
        }
    });
    return valid;
}

function setDifficuty(value){
    gameDifficuty = value;
}
updateGameTable()