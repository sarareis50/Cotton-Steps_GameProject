class FlorestaCena extends BaseScene {
    constructor() {
        super('FlorestaCena'); // Este é o nome interno que o Phaser usa para identificar a cena
    }

    preload() {
        super.preload();
        // Carrega o meu mapa da floresta
        this.load.tilemapTiledJSON('mapa_floresta', 'assets/tiled/FlorestZona1.JSON');
        

        this.load.image('cotton_beber_img', 'assets/imagens/beberagua/beberagua.png');

        const path = 'assets/imagens/FLORESTA/'; 

    this.load.image('fir tree', path + 'fir tree.png');
    this.load.image('birch tree', path + 'birch tree.png');
    this.load.image('fences', path + 'fences.png');
    this.load.image('rocks', path + 'rocks.png');
    this.load.image('crops', path + 'crops.png');
    this.load.image('grass & flowers', path + 'grass & flowers.png');
    this.load.image('hut', path + 'hut.png');
    this.load.image('TileSet_dirt', path + 'TileSet_dirt.png');
    this.load.image('TileSet_Grass', path + 'TileSet_Grass.png');
    this.load.image('TileSet_Water', path + 'TileSet_Water.png');
    this.load.image('Asset_Nature', path + 'Asset_Nature.png');
    this.load.image('TopDownHouse_FloorsAndWalls', path + 'TopDownHouse_FloorsAndWalls.png');
    }

    create() {
        this.dialogueManager = new DialogueManager(this);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.map = this.make.tilemap({ key: 'mapa_floresta' });

    this.iniciarMusicaGlobal();

    // --- calculo do offest para centralizar ---
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;
    
    // Calcula a margem para centralizar o mapa na tela
    const offsetX = Math.max(0, (gameWidth - this.map.widthInPixels) / 2);
    const offsetY = Math.max(0, (gameHeight - this.map.heightInPixels) / 2);

    // 1. Carrega os tilesets
    const ts = this.map.tilesets.map(tileset => {
        return this.map.addTilesetImage(tileset.name, tileset.name);
    });

    // 2. Cria as camadas e GUARDA a camada de colisão numa variável
    let camadaColisao = null;
    this.map.layers.forEach(layerData => {
        
        const layer = this.map.createLayer(layerData.name, ts, offsetX, offsetY);
        
        if (layerData.name.toLowerCase() === 'colisao') {
            layer.setCollisionByExclusion([-1]);
            layer.setVisible(false);
            camadaColisao = layer;
        }
    });
    
    // 3. Setup do jogador (agora o player vai existir)
    const spawnObj = this.map.findObject('spawn', obj => obj.name === 'spawn_floresta');
    this.setupPlayer(spawnObj.x, spawnObj.y);

    // 4. AGORA adiciono o collider, pois o player já existe!
    if (camadaColisao && this.player) {
        this.physics.add.collider(this.player, camadaColisao);
    }

        // --- Zona do Lago (O Final) ---
        const objLago = this.map.findObject('Eventos', obj => obj.name === 'zona_lago');
        this.zonaLago = this.add.rectangle(objLago.x + objLago.width/2, objLago.y + objLago.height/2, objLago.width, objLago.height);
        this.physics.add.existing(this.zonaLago, true);

        // --- Zona do Hawk ---
        const objHawk = this.map.findObject('hawk', obj => obj.name === 'hawk');
        if (objHawk) {
            this.zonaHawk = this.add.rectangle(objHawk.x + objHawk.width/2, objHawk.y + objHawk.height/2, objHawk.width, objHawk.height);
            this.physics.add.existing(this.zonaHawk, true);
            this.jaFalouComHawk = false; // Variável para garantir que ele só fala uma vez
        }

        
        this.finalAlcancado = false;
        this.estaAValar = false;

        // 1. Define os limites da câmara EXATAMENTE sobre o tamanho do mapa
    // Se o mapa é menor que a tela, isto mantém a câmara parada
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // 2. Centraliza a câmara na posição inicial (meio do mapa)
    this.cameras.main.centerOn(this.map.widthInPixels / 2, this.map.heightInPixels / 2);

    // 3. Força a câmara a seguir o jogador
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // 4. Se o mapa for menor que a tela, centralizamos o "mundo" no ecrã
    // Isso move a camada do mapa para o centro da tela
    if (this.map.widthInPixels < this.sys.game.config.width || this.map.heightInPixels < this.sys.game.config.height) {
        const x = (this.sys.game.config.width - this.map.widthInPixels) / 2;
        const y = (this.sys.game.config.height - this.map.heightInPixels) / 2;
        
        // Aplica a posição em todas as camadas
        this.map.layers.forEach(layer => {
            const l = this.map.getLayer(layer.name);
            l.tilemapLayer.setPosition(x, y);
        });
        
        // Ajusta a posição do jogador para compensar
        this.player.x += x;
        this.player.y += y;

    
        // Ajusta as zonas de evento que criei antes
        if (this.zonaLago) {
            this.zonaLago.x += x;
            this.zonaLago.y += y;
            this.zonaLago.body.updateFromGameObject();
        }
        if (this.zonaHawk) {
            this.zonaHawk.x += x;
            this.zonaHawk.y += y;
            this.zonaHawk.body.updateFromGameObject();
        }
    }}

    update() {
        if (!this.player) return;

        if (this.estaAValar) {
            this.player.setVelocity(0);
            this.player.anims.stop();
            return;
        }

        // --- Colisão com o Hawk ---
        if (this.zonaHawk && !this.jaFalouComHawk && this.physics.overlap(this.player, this.zonaHawk)) {
            this.iniciarDialogoHawk();
    }

        // Verifica colisão com o lago
        if (!this.finalAlcancado && this.physics.overlap(this.player, this.zonaLago)) {
            this.iniciarCenaFinal();
        }
        
        // Movimentação
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) { this.player.setVelocityX(-160); this.player.anims.play('andar_esquerda', true); }
        else if (this.cursors.right.isDown) { this.player.setVelocityX(160); this.player.anims.play('andar_direita', true); }
        else if (this.cursors.up.isDown) { this.player.setVelocityY(-160); this.player.anims.play('andar_cima', true); }
        else if (this.cursors.down.isDown) { this.player.setVelocityY(160); this.player.anims.play('andar_baixo', true); }
        else { this.player.anims.stop(); }
    }

  iniciarCenaFinal() {
    this.finalAlcancado = true;
    this.estaAValar = true;

    // Faço a Cotton parar de mover (velocidade 0)
    this.player.setVelocity(0);
    // E paro a animação que estava a tocar (ex: 'andar_baixo')
    this.player.anims.stop(); 

    // 1. Fade out da tela atual para preto
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
        // Esconde o player para que ele não apareça "por baixo" da imagem
        this.player.setVisible(false);

        // 2. Cria a imagem no centro da câmara
        const imgBeber = this.add.image(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            'cotton_beber_img'
        ).setScrollFactor(0).setDepth(2000).setAlpha(0);

        // Fade IN da imagem
        this.tweens.add({
            targets: imgBeber,
            alpha: 1,
            duration: 1500
        });

        this.cameras.main.fadeIn(1000);

        this.input.keyboard.once('keydown-ENTER', () => {
            // Fade OUT da imagem
            this.tweens.add({
                targets: imgBeber,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    imgBeber.destroy();
                    
                    // Volta a mostrar a Cotton antes de começar a dor de cabeça
                    this.player.setVisible(true); 

                    // 4. Efeito de dor de cabeça (pulsação)
                    const overlay = this.add.rectangle(
                        this.cameras.main.centerX, this.cameras.main.centerY, 
                        this.sys.game.config.width, this.sys.game.config.height, 
                        0x000000
                    ).setScrollFactor(0).setAlpha(0).setDepth(1000);

                    this.tweens.add({
                        targets: overlay,
                        alpha: 0.7,
                        duration: 600,
                        yoyo: true,
                        repeat: 2,
                        onComplete: () => {
                            // 5. Frase final
                            this.dialogueManager.falar("Sinto-me tonta....", 'cotton', 'sad');

                            this.input.keyboard.once('keydown-ENTER', () => {
                                this.dialogueManager.esconder();
                                this.cameras.main.once('camerafadeoutcomplete', () => {
                                    this.scene.start('FinalScene');
                                });
                                this.cameras.main.fadeOut(2000, 0, 0, 0);
                            });
                        }
                    });
                }
            });
        });
    });
}

    iniciarDialogoHawk() {
    this.jaFalouComHawk = true;
    this.estaAValar = true; 
    this.player.setVelocity(0);

    const falas = [
        { txt: "Hawk: Cotton? Tu ainda andas por aqui?", expr: 'surpreso' },
        { txt: "Cotton: Do que falas? Estou à procura da minha Dona!", expr: 'neutra' },
        { txt: "Hawk: Ela... ela esperou por ti junto ao lago até o seu fôlego acabar.", expr: 'triste' },
        { txt: "Hawk: Ela deixou algo para ti... Vai, bebe a água do lago.", expr: 'triste' },
        { txt: "Cotton: O que? Ela... ela me deixou algo?Vou lá AGORA!", expr: 'neutra' },
        { txt: "Hawk:...", expr: 'triste' },
        { txt: "Hawk: (Fala um tom baixo) O lago será o teu destino final minha querida amiga..", expr: 'triste' }
    ];
    
    let index = 0;
    const mostrarProximaFala = () => {
        if (index < falas.length) {
            const falaAtual = falas[index];
            const orador = falaAtual.txt.startsWith("Hawk:") ? 'hawk' : 'cotton';
            
            // Passa o texto, o orador e a expressão!
            this.dialogueManager.falar(falaAtual.txt, orador, falaAtual.expr);
            
            this.input.keyboard.once('keydown-ENTER', () => {
                index++;
                mostrarProximaFala();
            });
        } else {
            this.dialogueManager.esconder();
            this.estaAValar = false;
        }
    };
    mostrarProximaFala();
}
}