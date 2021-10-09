let BlockWidth = 20, // 每个方块的宽度
    Height = 20, // 高度
    tr = 30, // 行数
    td = 30; // 列数

let snake = null, // 蛇
    food = null, // 食物
    game = null; // 游戏

let flag = false; // 记录是否按下空格
// 方块构建
function BuildBlock(x, y, classname) {
    this.x = x * BlockWidth;
    this.y = y * Height;
    this.class = classname;

    this.viewContent = document.createElement('div');
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap');

}

// 创建方块dom
BuildBlock.prototype.create = function () {
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = BlockWidth + 'px';
    this.viewContent.style.height = Height + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';

    this.parent.appendChild(this.viewContent)

}
// 移除方块dom
BuildBlock.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
}

// 蛇
function Snake() {
    this.head = null; //蛇头
    this.tail = null; // 蛇尾
    this.position = []; // 存储蛇身上的每一个方块的位置
    this.directionObj = { // 存储蛇走的方向，用一个对象来表示
        left: {
            x: -1,
            y: 0,
            rotate: 180 // 蛇头旋转角度
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }
    }
}

Snake.prototype.init = function () {
    // 创建蛇头
    let snakeHead = new BuildBlock(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead; // 存储蛇头数据
    this.position.push([2, 0]) // 存储蛇头位置
    // 创建蛇身体
    let snakeBody1 = new BuildBlock(1, 0, 'snakeBody');
    snakeBody1.create();
    this.position.push([1, 0]) // 存储蛇身位置

    let snakeBody2 = new BuildBlock(0, 0, 'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2; // 存储蛇尾数据
    this.position.push([0, 0]) // 存储蛇身位置

    // 形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    // 蛇走的方向
    this.direction = this.directionObj.right; // 默认右

}

// 获取蛇头的下个位置对应的元素
Snake.prototype.getNextPos = function () {
    let nextPos = [
        this.head.x / BlockWidth + this.direction.x,
        this.head.y / Height + this.direction.y
    ]
    // 下个点是自己，游戏结束
    let selfCollied = false; //是否撞到了自己
    this.position.forEach(function (value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfCollied = true;
        }
    });
    if (selfCollied) {
        console.log('撞到了自己');
        this.strategies.die.call(this);
        return;
    }
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
        console.log('撞到了墙');
        this.strategies.die.call(this);
        return;
    }
    if (food && food.position[0] == nextPos[0] && food.position[1] == nextPos[1]) {
        // 如果这个条件成立说明现在蛇头要走的下一个点是食物的那个点；
        console.log('吃到食物了');
        this.strategies.eat.call(this);
        return;
    }
    this.strategies.move.call(this);
};

// 处理碰撞后的事件
Snake.prototype.strategies = {
    move: function (format) { // format：是否删除蛇尾
        // 创建新身体，在旧蛇头的位置
        let newBody = new BuildBlock(this.head.x / BlockWidth, this.head.y / Height, 'snakeBody');
        // 更新链表的关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;

        this.head.remove(); // 删除旧蛇头原位置
        newBody.create();

        // 创建蛇头:蛇头下个位置
        let newHead = new BuildBlock(this.head.x / BlockWidth + this.direction.x, this.head.y / Height + this.direction.y, 'snakeHead');

        // 更新链表的关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;

        newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)';

        newHead.create();

        // 更新蛇身上每个方块的位置
        this.position.splice(0, 0, [this.head.x / BlockWidth + this.direction.x, this.head.y / Height + this.direction.y]);
        this.head = newHead; //更新this.head

        if (!format) { // false:删除
            this.tail.remove();
            this.tail = this.tail.last;
            this.position.pop();
        }
    },
    eat: function () {
        this.strategies.move.call(this, true);
        createFood();
        game.score++;
    },
    die: function () {
        game.over();
    }
}

snake = new Snake();
// 创建食物
function createFood() {
    // 食物的随机位置
    let x = null;
    let y = null;
    let include = true; // true：食物坐标在蛇身上 false：相反
    while (include) {
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));
        snake.position.forEach(function (value) {
            if (x != value[0] && y != value[1]) {
                include = false;
            }
        })
    }
    // 生成食物
    food = new BuildBlock(x, y, 'food');
    food.position = [x, y]; // 存储食物的位置

    let foodDom = document.querySelector('.food');
    if (foodDom) {
        foodDom.style.left = x * BlockWidth + 'px';
        foodDom.style.top = y * Height + 'px';
    } else {
        food.create();
    }
}

// 创建游戏
function Game() {
    this.timer = null;
    this.score = 0;

}
Game.prototype.init = function () {
    snake.init();
    createFood();

    document.onkeydown = function (ev) {
        // console.log(ev);
        if (ev.keyCode == 37 && snake.direction != snake.directionObj.right) {
            snake.direction = snake.directionObj.left;
        } else if (ev.keyCode == 38 && snake.direction != snake.directionObj.down) {
            snake.direction = snake.directionObj.up;
        } else if (ev.keyCode == 39 && snake.direction != snake.directionObj.left) {
            snake.direction = snake.directionObj.right;
        } else if (ev.keyCode == 40 && snake.direction != snake.directionObj.up) {
            snake.direction = snake.directionObj.down;
        }else if (ev.keyCode == 32) {
            flag = !flag;
            if(flag){
                game.pause();
                pauseBtn.parentNode.style.display = 'block';
            }else{
                game.start();
                pauseBtn.parentNode.style.display = 'none';
            }
        }
    }
    this.start();
}

// 开始游戏
Game.prototype.start = function () {
    this.timer = setInterval(function () {
        snake.getNextPos();
    }, 220);
}

// 暂停游戏
Game.prototype.pause = function () {
    clearInterval(this.timer);
}

// 结束游戏
Game.prototype.over = function () {
    clearInterval(this.timer);
    alert('你的得分为：' + this.score);
    // 游戏回到最初始的状态
    let snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();

    let startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
}

// 开启游戏
game = new Game();

let startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none';
    game.init();
}

// 暂停游戏
let snakeWrap = document.getElementById('snakeWrap');
let pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function () {
    game.pause();
    pauseBtn.parentNode.style.display = 'block';
}
pauseBtn.onclick = function () {
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}