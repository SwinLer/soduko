var count; //计时器


//计时器
class TimeClock{
    constructor(){
        this.timep=document.getElementById("time-tip");
        this.startTime=new Date();
        this.isstarted=false;
    }
 
    //开始计时
    start(){
        count=0;
        let alertf=document.getElementById("alert-field");
        alertf.innerHTML="";
        if(!this.isstarted){
            this.startTime=new Date();
            this.timer=setInterval(()=>{this.countTime()},1000);
            this.isstarted=true;
        }
    }

    //停止计时
    stop(){
        this.isstarted=false;
        clearInterval(this.timer);
        this.timep.innerHTML="00:00:00";
    }

    //刷新时间显示
    countTime(){
        count++;
        let s=this.checkTime(count%60);
        let m=this.checkTime(parseInt(count/60)%60);
        let h=this.checkTime(parseInt(count/60/60));
        //console.log(count);
        this.timep.innerHTML=h+":"+m+":"+s;
    }

    //给十位数为空处添加0
    checkTime(num){
        if(num<10){
            return '0'+num;
        }
        return num;
    }
}

class Operation {
    //去除重复元素
    static distinct(array) {
        let result = array.sort().reduce( (p, c) => {
            if( p.length == 0 || p[p.length-1] != c ) {
                p.push( c );
            }
            return p;
        }, []);
        return result;
    }

    //数组A-B
    static getMinusArray(inf) {
        inf = ( inf === undefined ) ? {} : inf;
        let A = inf.A;
        let B = inf.B;
        if( B && B.length > 0 ) {
            A = [];
            for(let i = 1; i <= 9; i += 1) {
                if(B.indexOf(i) == -1) {
                    A.push(i)
                }
            }
            //升序排列
            A.sort( (a, b) => {
                return a > b;  
            });

        } else if( A === undefined ) {
            A = this.getBasicArray();
        }
        //是否打乱排序
        if( !inf.order ){
            return this.randomArray(A);
        }else{
            return A;
        }
    }

    //判断是否构成9数字数独
    static isCellsValueValid( v ) {
        let sum   = 0;
        let value = this.distinct(v);
        for( let i = 0; i < 9; i++ ) {
            sum += value[i];
        }
        if( sum == 45 ) {
            return true;
        }
        return false;
    }

    //打乱排序
    static randomArray(array) {
        let size = array.length;
        let a = new Array(size);
        let newIndex;
        let num = 0;
        for(let i = 0; i < size; i++) {
            newIndex = Math.floor( Math.random() * (size - num) );
            a[i] = array[newIndex];
            array[newIndex] = array[ size - 1 - num ];
            array[ size - 1 - num ] = 0;
            num++;
        }
        return a;
    }

    //获取一组基础数独
    static getBasicArray() {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }
}

//单位格子元素
class Cell {
    constructor( row, col ) {
        this.row = row;
        this.col = col;
        this.visibility = true;
        this.value = 0;
        this.inputvalue = 0;
    }

    setValue( value ) {
        this.value = value;
    }

    //玩家输入值
    setInputValue( value ) {
        this.inputvalue = value;
    }

    //设置单位格子元素是否可见
    setVisible( v ) {
        this.visibility = v;
    }

    //判断输入值与预设值是否相等
    isRight() {
        return this.value === this.inputvalue;
    }

    //判断单位格子元素是否可见
    isVisible() {
        return this.visibility;
    }

    //判断是否输入数字
    static isValidValue(v) {
        if( v > 0 && v < 10 ) {
            return true;
        }
        return false;
    }

    //返回3*3单位块的行列信息
    static getBlockLine(cell) {
        let block = {};
        block.row = Math.floor( cell.row / 3 );
        block.col = Math.floor( cell.col / 3 );
        return block;
    }
}

//游戏表
class Table {
    constructor() {
        this.width=9;
        this.height=9;
        this.cells = new Array( 81 );
        for( let i = 0; i < 9; i++ ) {
            for( let j = 0; j < 9; j++ ) {
                this.cells[i * 9 + j] = new Cell( i, j );
            }
        }
    }

    init() {
        let row0 = this.getRow(0);
        //获取基础数独数组
        let a = Operation.getMinusArray();
        let temp = 0;
        let used, unused,cell, index;

        a.forEach( (element, index ) => {
            row0[index].setValue( element );
        });

        for(let i = 1; i < 9; i += 1) {
            for(let j = 0; j < 9; j += 1) {
                cell = this.cells[i*9+j];
                if( cell.choice === undefined ) {
                    used = this.getUsedValueArray( {row: i, col: j} );
                    //console.log(used);
                    unused = Operation.getMinusArray( {B: used} );
                    //console.log(unused);
                    cell.choice = new Choice( unused );
                }
                index = this.fillCell(cell);
                i = index.i; 
                j = index.j;
                temp += 1;
            }
        }
    }

    //填充单位格子元素
    fillCell(cell) {
        let i = cell.row, j = cell.col;
        let value = cell.choice.moveToNext();
        if( value !== undefined ) {
            cell.setValue(value);
        }else {
            //回溯判断
            cell.value  = 0;
            cell.choice = undefined;
            if( j == 0 ) {
                i -= 1;
                j -= 1;
                //将回溯前本行填充的格子置空
                this.emptyCells({rowStart: i, rowEnd: i+1, colStart: 1, colEnd: 9});  // 返回上一行后，清空该行其它列的数据
            }else {
                j -= 2;
            }
        }
        return {i, j};
    }

    /**
     * 获取位置 pos 上可以存放的值集合（乱序）
     * 
     * 注意，可能会出现每个位置没有可用的数字，这时该函数返回 0 而不是 undefined
     * @param {{row: Number, col: Number}} pos 
     * @return Number
     
    getRandomValidValue(pos) {
        let used = this.getUsedValueArray(pos);
        let valueArray = Operation.getMinusArray({B: used});
        return valueArray[0] === undefined ? 0 : valueArray[0];
    }
*/
    //获取不同区域内使用过的元素
    getUsedValue( inf ) {
        let cells = this.getCells( inf );
        let a = new Array();
        cells.forEach( cell => {
            if( Cell.isValidValue( cell.value ) )
                a.push( cell.value )
        });
        return a;
    }

    //获取相应位置对应全部区域内使用过元素
    getUsedValueArray(pos) {
        let row = pos.row;
        let col = pos.col;
        let block = Cell.getBlockLine(pos);
        let used = new Array();
        
        let rowCells = this.getUsedValue( {mode: "row", row: row} );
        let colCells = this.getUsedValue( {mode: "col", col: col});
        let blockCells = this.getUsedValue( {mode: "block", row: block.row, col: block.col} );

        used.push.apply( used, rowCells );
        used.push.apply( used, colCells );
        used.push.apply( used, blockCells );
        let result = Operation.distinct( used );

        return result;
    }

    //获取行元素
    getRow( row ) {
        let re = new Array( 9 );
        for( let i = 0; i < 9; i++ ) {
            re[i] = this.cells[i + row * 9];
        }
        return re;
    }

    //获取列元素
    getCol( col ) {
        let colArray = new Array( 9 );

        for( let i = 0; i < 9; i++ ) {
            colArray[i] = this.cells[i * 9 + col];
        }

        return colArray;
    }

    //获取3*3块元素
    getBlock( row, col ) {
        let block = new Array( 9 );
        for( let i = 0; i < 3; i++ ) {
            for( let j = 0; j < 3; j++ ) {
                block[i * 3 + j] = this.cells[ ( row ) * 27 + col * 3 + i * 9 + j ];
            }
        }
        return block;
    }

    //获取定义区域元素
    getArea(area) {
        let size = (area.rowEnd - area.rowStart) * (area.colEnd - area.colStart);
        let re = new Array();
        if( size <= 0 ) { 
            return re;
        }
        for(let i = area.rowStart; i < area.rowEnd; i++) {
            for( let j = area.colStart; j < area.colEnd; j++ ) {
                re.push( this.cells[i*9+j] );
            }
        }
        return re;
    }

    //单位格子元素置0
    emptyCells(area) {
        let re = this.getArea(area);
        re.forEach( cell => {
            cell.value = 0;
            cell.choice = undefined;
        });
    }

    //获取行或列或块内单位元素
    getCells(inf) {
        let mode = inf.mode;
        let cells;
        switch (mode) {
            case "row":
                cells = this.getRow( inf.row );
                break;
            case "col":
                cells = this.getCol( inf.col );
                break;
            case "block":
                cells = this.getBlock( inf.row, inf.col );
                break;
            default: 
                cells = new Array();
                break;
        }
        return cells;
    }

    //判断玩家输入值是否正确并填写
    setValueAt( row, col, num ) {
        if(row < 0 || row > 8 || col < 0 || col > 8 || num < 0 || num > 9 ) {
            console.log("wrong input");
            return;
        }
        let cell = this.cells[row * 9 + col];
        cell.setInputValue( num );
    }

    //判断行 列 块 是否数独
    isValid(isinput) {
        let sum = 0;
        let valid = true;
        let cells;
        //行判断
        for(let i = 0; i < 9; i++) {
            cells = this.getRow(i);
            sum = this.sumCells( cells, isinput );
            valid &= ( sum === 45 );
            sum = 0;
        }
        //列判断
        for(let i = 0; i < 9; i++) {
            cells = this.getCol(i);
            sum = this.sumCells( cells, isinput );
            valid &= ( sum === 45 );
            sum = 0;
        }
        //块判断
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                cells = this.getBlock(i, j);
                sum = this.sumCells( cells, isinput );
                valid &= ( sum === 45 );
                sum = 0;
            }
        }
        return valid;
    }

    //判断行 列 块是否重复
    isDistinct( pos ){
        let rowCells = this.getRow( pos.row );
        let colCells = this.getCol( pos.col );
        let block = Cell.getBlockLine( pos );
        let blockCells = this.getBlock( block.row, block.col );
        let num = pos.num;

        if( this.isAreaDistinct( rowCells, num ) ){
            if( this.isAreaDistinct( colCells, num ) ){
                if( this.isAreaDistinct( blockCells, num ) ){
                    return true;
                }
            }
        }

        return false;
    }

    //判断数组是否有重复值
    isAreaDistinct(array, input){
        let a = new Array(array.length);
        let b = new Array();

        for(let i = 0; i < array.length; i++){
            if( array[i] != undefined ){
                if( !array[i].isVisible() ){
                    a.push(Number.parseInt(array[i].inputvalue));
                }else{                    
                    a.push(array[i].value);
                }
            }
        }
        a.push( Number.parseInt(input) );
        a.forEach( c => {
            if( c !=0 ){
                b.push( c );
            }
        })
        b = b.sort();
        //console.log(b);
        for( let i = 0; i < b.length-1; i++ ){
            if(b[i] == b[i+1]){
                return false;
            }
        }
        return true;
    }

    //元素求和
    sumCells(cells, isinput) {
        let sum = 0;
        cells.forEach(c => {
            if( isinput && !c.isVisible()) {
                sum += c.inputvalue;
            }else {
                sum += c.value;
            }
        });
        return sum;
    }
}

//记录当前选择
class Choice {
    constructor(choice) {
        this.choice = choice;
        this.index = -1;
    }

    //移动到下一个索引
    moveToNext() {
        this.index++;
        if(this.index <= this.choice.length) {
            return this.choice[this.index];
        }
        return undefined;
    }
}

//Table.width  = 9;
//Table.height = 9;

class Game {
    constructor( difficuty ) {
        this.table = new Table();
        this.table.init();
        this.dignum = difficuty*2;
        this.digTable();
    }

    //挖格子
    digTable() {
        let num = 0, block;
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                for( let k = 0; k < this.dignum; k++) {
                    block = this.table.getBlock(i, j);
                    num = Math.floor( Math.random() * 9 );
                    if( block[num].isVisible() ) {
                        block[num].setVisible(false);
                    } 
                }
            }
        }
    }

    //获取行列处值
    getValue(row, col) {
        let cell = this.table.cells[ row * 9 + col ];
        if( cell.isVisible() )
            return cell.value;

        return undefined
    }

}

//未实例化前属性
Game.DifficutyEasy = 1;
Game.DifficutyNormal = 2;
Game.DifficutyHard = 3;
