canvasRenderer.updateRender({
    setup() {
        this.fontSize = 40;
        this.tokens = ["x", "o", "tie"];
        this.mode = 1;
        this.delay = 300;
        this.board = new Grid(0, 0, this.width, this.height, 3, 3);
        this.board.forEach(cell => {
            cell.addEventListener("click", () => {
                if (this.mode !== 2) {
                    if (this.mode === 0) {
                        this.place(cell);
                    } else if (this.mode === 1) {
                        if (this.player === 1) {
                            this.place(cell);
                        }
                    }
                }
            });
            cell.addEventListener("mouseover", () => cell.color = new Color(230));
            cell.addEventListener("mouseout", () => cell.color = new Color(255));
        });
        this.reset();
    },
    reset() {
        this.player = 1;
        this.winner = 0;
        this.board.forEach(cell => cell.piece = 0);
        if (this.mode === 2) {
            this.botTurn();
        }
    },
    boardString() {
        let rows = [
            [],
            [],
            []
        ];
        this.board.forEach(cell => {
            rows[cell.posy][cell.posx] = cell.piece ? cell.piece.string : "-";
        });
        return [...rows[0], ...rows[1], ...rows[2]].join("");
    },
    getCell(x, y) {
        let found = false;
        const cells = this.board.forEach((cell, i) => {
            if (cell.posx === x && cell.posy === y) {
                found = cell;
            }
        });
        return found;
    },
    isEmpty(cell) {
        return !cell.piece;
    },
    randomCell() {
        const randX = Math.floor(Math.random() * Math.floor(3));
        const randY = Math.floor(Math.random() * Math.floor(3));
        const cell = this.getCell(randX, randY);
        if (this.isEmpty(cell)) {
            return cell;
        } else {
            return this.randomCell();
        }
    },
    botTurn() {
        setTimeout(() => this.place(this.randomCell()), this.delay);
    },
    place(cell) {
        if (!this.winner && !cell.piece) {
            let x = cell.x + (cell.width / 2);
            let y = cell.y + (cell.height / 2) - (this.fontSize / 2);
            if (this.player === 1) {
                cell.piece = new Text(this.tokens[0], x, y, this.fontSize);
            } else if (this.player === 2) {
                cell.piece = new Text(this.tokens[1], x, y, this.fontSize);
            }
            cell.piece.textAlign = "center";
            cell.piece.fontFamily = "Verdana";
            let gameOver = this.gameOver();
            if (!gameOver) {
                this.player = this.player === 1 ? 2 : 1;
                if ((this.mode === 2) || (this.mode === 1 && this.player === 2)) {
                    this.botTurn();
                }
            }
        }
    },
    gameOver() {
        return this.isWinner(0, 1, 2) || this.isWinner(3, 4, 5) || this.isWinner(6, 7, 8) || this.isWinner(0, 3, 6) || this.isWinner(1, 4, 7) || this.isWinner(2, 5, 8) || this.isWinner(0, 4, 8) || this.isWinner(6, 4, 2) || this.isTie();
    },
    isWinner(p1, p2, p3) {
        const s = this.boardString();
        const c1 = s.charAt(p1);
        if (c1 == '-') return false;
        const c2 = s.charAt(p2);
        if (c1 != c2) return false;
        const c3 = s.charAt(p3);
        if (c1 != c3) return false;
        this.winner = c1;
        return true;
    },
    isTie() {
        const s = this.boardString();
        for (let i = 0; i < 9; i++) {
            if (s.charAt(i) == '-') return false;
        }
        this.winner = this.tokens[2];
        return true;
    },
    draw() {
        if (!this.winner) {
            this.add(this.board);
            this.board.forEach(cell => {
                if (cell.piece) {
                    this.add(cell.piece);
                }
            });
        } else {
            let overlay = new Rect(0, 0, this.width, this.height);
            if (this.winner === this.tokens[0]) {
                overlay.setColor("green");
            } else if (this.winner === this.tokens[1]) {
                overlay.setColor("red");
            } else if (this.winner === this.tokens[2]) {
                overlay.setColor("skyblue");
            }
            let winnerText = new Text("Winner: \n" + this.winner, this.halfWidth(), this.halfHeight(), 30);
            winnerText.textAlign = "center";
            winnerText.fontFamily = "Verdana";
            let newGame = new Rect(this.halfWidth(150), this.halfHeight() + 100, 150, 50);
            if (newGame.contains(this.mouseX, this.mouseY)) {
                if (this.mouseDown) {
                    setTimeout(() => {
                        this.reset();
                    }, this.delay);
                }
                newGame.setColor(255);
            } else {
                newGame.setColor(200);
            }
            if (this.mode === 2) {
                setTimeout(() => {
                    this.mode = 2;
                    this.reset();
                }, this.delay);
                this.mode = 1;
            }
            let newGameText = new Text("New Game", newGame.x + (newGame.width / 2), newGame.y + (newGame.height / 2) - 10);
            newGameText.textAlign = "center";
            newGameText.fontFamily = "Verdana";
            this.add(overlay);
            this.add(winnerText);
            this.add(newGame);
            this.add(newGameText);
        }
    }
});