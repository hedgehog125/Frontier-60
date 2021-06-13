let game = Bagel.init({
    id: "game",
    state: "game",
    game: {
        assets: {
            imgs: [
                {
                    id: "Enemy.0",
                    src: "assets/imgs/smallEnemy.png",
                },
                {
                    id: "Enemy.1",
                    src: "assets/imgs/roundboiEnemy.png",
                }
            ],
            spritesheets: [
                {
                    id: "Spaceship",
                    src: "assets/imgs/spaceship.png",
                    frames: [4],
                    animations: ["0"]
                },
                {
                    id: "Stars",
                    src: "assets/imgs/stars.png",
                    frames: [3],
                    animations: ["0"]
                }
            ]
        },
        sprites: [
            {
                id: "Spaceship",
                request: {
                    game: {
                        spritesheets: ["Spaceship"]
                    }
                },
                scripts: {
                    steps: {
                        input: me => {
                            if (game.input.mouse.down) {
                                me.vars.vel.x += (game.input.mouse.x - me.x) / 20;
                                me.vars.vel.y += (game.input.mouse.y - me.y) / 20;
                            }
                            else {
                                me.vars.vel.x += (game.input.mouse.x - me.x) / 80;
                                me.vars.vel.y += (game.input.mouse.y - me.y) / 80;
                            }

                            if (game.input.mouse.down) {
                                if (me.x < 600 && me.vars.vel.x >= 50) {
                                    game.vars.scroll = 40;
                                }
                            }
                            else {
                                game.vars.scroll = 1;
                            }
                        },
                        move: me => {
                            let vel = me.vars.vel;

                            let toRight = me.x > game.input.mouse.x;
                            let under = me.y > game.input.mouse.y;

                            me.x += vel.x;
                            me.y += vel.y;

                            if (me.x > game.input.mouse.x != toRight) {
                                vel.x *= 0.2;
                            }
                            if (me.y > game.input.mouse.y != under) {
                                vel.y *= 0.2;
                            }

                            vel.x *= 0.9;
                            vel.y *= 0.9;

                            if (me.left < 0) {
                                me.left = 0;
                            }
                            if (me.right >= game.width) {
                                me.right = game.width;
                            }

                            if (me.top < 0) {
                                me.top = 0;
                            }
                            if (me.bottom >= game.height) {
                                me.bottom = game.height;
                            }
                        },
                        collision: me => {
                            while (true) {
                                if (me.touching.sprite("Enemies", {}, sprite => ! sprite.vars.attacking)) {
                                    let sprite = me.last.collision.sprite;
                                    let collisionVars = sprite.vars;

                                    let xMove = me.vars.vel.x + game.vars.scroll;
                                    let yMove = me.vars.vel.y;
                                    if (Math.abs(xMove) < 0.025) {
                                        xMove = 0;
                                    }
                                    if (Math.abs(yMove) < 0.025) {
                                        yMove = 0;
                                    }

                                    collisionVars.vel.x += xMove;
                                    collisionVars.vel.y += yMove;

                                    let xSubMove, ySubMove;
                                    if (Math.abs(xMove) > Math.abs(yMove)) {
                                        xSubMove = Math.sign(xMove);
                                        if (yMove == 0) {
                                            ySubMove = 0;
                                        }
                                        else {
                                            ySubMove = yMove / Math.abs(xMove);
                                        }
                                    }
                                    else {
                                        if (xMove == 0) {
                                            xSubMove = 0;
                                        }
                                        else {
                                            xSubMove = xMove / Math.abs(yMove);
                                        }
                                        ySubMove = Math.sign(yMove);
                                    }

                                    while (true) {
                                        sprite.x += xSubMove;
                                        sprite.y += ySubMove;

                                        if (! me.touching.sprite(sprite.id)) {
                                            break;
                                        }
                                    }
                                }
                                else {
                                    break;
                                }
                            }
                        },
                        animate: me => {
                            let vars = me.vars;

                            me.img = "Spaceship.0." + vars.animationFrame;
                            vars.animationTick++;
                            if (vars.animationTick >= 15 / Math.max(1, ((me.vars.vel.x + me.vars.vel.y) + game.vars.scroll) / 5)) {
                                vars.animationTick = 0;
                                vars.animationFrame++;
                                if (vars.animationFrame == 4) {
                                    vars.animationFrame = 0;
                                }
                            }
                        }
                    },
                    init: [
                        {
                            code: me => {
                                me.vars = {
                                    animationFrame: 0,
                                    animationTick: 0,
                                    attached: new Array(10).fill(false),
                                    attachCoords: [
                                        //[-100, -36],
                                        [-67, -36],
                                        [-33, -36],
                                        [0, -36],
                                        [33, -36],
                                        [67, -36],
                                        //[100, -36],

                                        //[-100, 36],
                                        [-67, 36],
                                        [-33, 36],
                                        [0, 36],
                                        [33, 36],
                                        [67, 36],
                                        //[100, 36]
                                    ],
                                    vel: {
                                        x: 0,
                                        y: 0
                                    }
                                };

                                game.vars.scroll = 0;
                            },
                            stateToRun: "game"
                        }
                    ],
                    main: [
                        {
                            code: (me, game, step) => {
                                step("input");
                                step("move");
                                step("collision");
                                step("animate");
                                me.layer.bringToFront();
                            },
                            stateToRun: "game"
                        }
                    ]
                },
                img: "Spaceship.0.0",
                scale: 8
            },
            {
                id: "Enemies",
                clones: {
                    scripts: {
                        init: [
                            me => {
                                me.scale = 3;
                                me.img = "Enemy." + me.vars.type;
                                me.left = game.width;
                                me.width *= -1;

                                // Avoid the edges
                                if (me.top < 0) {
                                    me.top = 0;
                                }
                                if (me.bottom >= game.height) {
                                    me.bottom = game.height - 1;
                                }

                                if (me.vars.type == 0) {
                                    me.vars.mass = 2;
                                    me.vars.attackDelay = Math.round(Math.random() * 1200) + 120;
                                    me.vars.attacking = false;
                                }
                                else if (me.vars.type == 1) {
                                    me.vars.mass = 10;
                                }

                                if (me.touching.sprite("Enemies")) {
                                    let direction = 1;
                                    if (Math.random() > 0.5) {
                                        direction = -1;
                                    }

                                    while (true) {
                                        me.y += direction;
                                        if (me.bottom < 0) {
                                            me.delete();
                                            return;
                                        }
                                        if (me.top >= game.height) {
                                            me.delete();
                                            return;
                                        }

                                        if (! me.touching.sprite("Enemies")) {
                                            break;
                                        }
                                    }
                                }
                            }
                        ],
                        main: [
                            (me, game, step) => {
                                let player = game.get.sprite("Spaceship");
                                if (me.vars.type == 0) {
                                    if (me.vars.attacking) {
                                        if (me.vars.docked || me.touching.sprite("Spaceship")) {
                                            if (! me.vars.docked) {
                                                me.vars.docked = true;
                                                me.vars.vel.forward = 0;
                                                me.angle = 90;
                                            }
                                            let attachCoords = me.vars.attachCoords;
                                            me.x = player.x + attachCoords[0];
                                            me.y = player.y + attachCoords[1];
                                        }
                                        else {
                                            let target = Bagel.maths.get.direction(me.x, me.y, player.x, player.y);

                                            me.angle = target;
                                            me.vars.vel.forward += 2;
                                        }
                                    }
                                    else {
                                        if (me.vars.attackDelay <= 0) {
                                            let attachCoords, slotIndex;
                                            if (me.vars.slotIndex == null) {
                                                slotIndex = player.vars.attached.indexOf(false);
                                                if (slotIndex == -1) {
                                                    me.vars.attackDelay = Math.round(Math.random() * 300) + 30;
                                                }
                                                else {
                                                    player.vars.attached[slotIndex] = true;
                                                    attachCoords = player.vars.attachCoords[slotIndex];
                                                    me.vars.slotIndex = slotIndex;
                                                    me.vars.attachCoords = attachCoords;

                                                    me.angle = -90;
                                                    me.width *= -1;
                                                }
                                            }
                                            else {
                                                attachCoords = me.vars.attachCoords;
                                            }

                                            if (slotIndex != -1) {
                                                let target = Bagel.maths.get.direction(me.x, me.y, player.x, player.y);

                                                if (me.vars.attackDelay < -45 && me.angle > target != me.angle + me.vars.vel.angle <= target) {
                                                    me.vars.vel.angle = 0;
                                                    me.vars.attacking = true;
                                                    me.angle = target;
                                                    me.move(5);
                                                }
                                                else {
                                                    me.vars.vel.angle += 3;
                                                }

                                                me.x += game.vars.scroll; // So it stays still relative to the camera
                                            }
                                        }
                                        me.vars.attackDelay--;
                                    }
                                }

                                me.x -= game.vars.scroll;

                                let vel = me.vars.vel;
                                me.x += vel.x / me.vars.mass;
                                me.y += vel.y / me.vars.mass;
                                me.angle += vel.angle / me.vars.mass;
                                me.move(vel.forward / me.vars.mass);

                                vel.x *= 1 - ((1 / me.vars.mass) / 30);
                                vel.y *= 1 - ((1 / me.vars.mass) / 30);
                                vel.angle *= 1 - ((1 / me.vars.mass) / 25);
                                vel.forward *= 1 - ((1 / me.vars.mass) / 30);


                                if (me.left > game.width * 3) { // Too far ahead
                                    me.delete();
                                    return;
                                }
                                if (me.right < 0) {
                                    me.delete();
                                    return;
                                }

                                if (me.bottom < 0) {
                                    me.delete();
                                    return;
                                }
                                if (me.top >= game.height) {
                                    me.delete();
                                    return;
                                }
                            }
                        ]
                    }
                },
                vars: {
                    vel: {
                        x: 0,
                        y: 0,
                        angle: 0,
                        forward: 0
                    }
                },
                scripts: {
                    init: [
                        {
                            code: me => {
                                me.vars.spawnTick = 0;
                                me.visible = false;
                            },
                            stateToRun: "game"
                        }
                    ],
                    main: [
                        {
                            code: me => {
                                me.vars.spawnTick += game.vars.scroll;
                                if (me.vars.spawnTick >= 60) {
                                    me.vars.spawnTick = 0;
                                    let type = 0;
                                    if (Math.random() > 0.8) {
                                        type = 1;
                                    }

                                    me.clone({
                                        y: Math.random() * game.height,
                                        vars: {
                                            type: type
                                        },
                                        visible: true
                                    });
                                }
                            },
                            stateToRun: "game"
                        }
                    ]
                },
                request: {
                    game: {
                        imgs: [
                            "Enemy.0",
                            "Enemy.1"
                        ]
                    }
                }
            },
            {
                id: "Stars",
                request: {
                    game: {
                        spritesheets: ["Stars"]
                    }
                },
                img: "Stars.0.0",
                clones: {
                    scripts: {
                        main: [
                            me => {
                                me.x -= game.vars.scroll;
                                if (me.x < 0) {
                                    me.y = Math.random() * game.height;
                                    me.left += game.width;
                                    me.parent.vars.toSpawn++;
                                }
                            }
                        ]
                    }
                },
                scripts: {
                    init: [
                        {
                            code: me => {
                                me.visible = false;

                                let i = 0;
                                while (i < 250) {
                                    me.clone({
                                        x: Math.random() * game.width,
                                        y: Math.random() * game.height,
                                        img: "Stars.0." + Math.round(Math.random() * 2),
                                        scale: 10,
                                        visible: true
                                    });
                                    i++;
                                }
                            },
                            stateToRun: "game"
                        }
                    ]
                }
            }
        ]
    },
    width: 800,
    height: 450,
    config: {
        display: {
            backgroundColour: "black"
        }
    }
});
