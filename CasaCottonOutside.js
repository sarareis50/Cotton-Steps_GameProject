class CasaCottonOutside extends BaseScene {
    constructor() {
        super('CasaCottonOutside');
    }

    preload() {
    super.preload();
    this.load.tilemapTiledJSON('mapa_fora', 'assets/tiled/CasaCottonOutside.JSON');

    this.load.image('cotton_sad', 'assets/imagens/cotton/cotton_sad.png');

    const path = 'assets/imagens/CASA_COTTON_PARTES_EXTERIOR/';

    // A chave (o primeiro nome) tem de ser IGUAL ao nome do tileset no JSON!
    this.load.image('birch tree', path + 'birch tree.png'); 
    this.load.image('crops', path + 'crops.png');
    this.load.image('exterior', path + 'exterior.png');
    this.load.image('fir tree', path + 'fir tree.png'); 
    this.load.image('TileSet_dirt', path + 'TileSet_dirt.png');
    this.load.image('TileSet_Grass', path + 'TileSet_Grass.png');
    this.load.image('TileSet_Hills', path + 'TileSet_Hills.png');
    
    this.load.image('TopDownHouse_FloorsAndWalls', path + 'TopDownHouse_FloorsAndWalls.png');
  }

    create() {
        // Inicializa o gestor de diálogos passando esta cena como contexto
    this.dialogueManager = new DialogueManager(this);

    // Cria a instância do mapa a partir da chave carregada no preload
    this.map = this.make.tilemap({ key: 'mapa_fora' });

    this.iniciarMusicaGlobal();
    this.cursors = this.input.keyboard.createCursorKeys();


    this.teclaEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Cria os conjuntos de tiles (imagens) que o Phaser usará para desenhar o mapa
    // 1. Carrega os tilesets automaticamente do JSON
    const ts = this.map.tilesets.map(tileset => {
        return this.map.addTilesetImage(tileset.name, tileset.name);
    });


    // 2. Calcula offsets
    // gameWidth/Height são as dimensões totais da tela do jogo
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;
    // Subtraío o tamanho do mapa ao tamanho da tela e dividimos por 2
        // Isso vai garantir que o mapa fique centrado, evitando que fique preso no canto superior esquerdo (0,0)
    const offsetX = (gameWidth - this.map.widthInPixels) / 2;
    const offsetY = (gameHeight - this.map.heightInPixels) / 2;

    // 3. Desenha TODAS as camadas, sem filtrar nomes
    // Loop que percorre todas as camadas (layers) do mapa Tiled
    this.map.layers.forEach(layerData => {
        const layer = this.map.createLayer(layerData.name, ts, offsetX, offsetY);

        // Se for a camada de colisão, configuramos apenas a física
        if (layerData.name.toLowerCase() === 'colisao') {
            layer.setVisible(false);
            layer.setCollisionByExclusion([-1]);
            if (this.player) {
                this.physics.add.collider(this.player, layer);
            }
        }
    });

    // 4. Setup do Player (garante que ele é criado DEPOIS do mapa)
    const spawnObj = this.map.findObject('spawnexteriorcasa', obj => obj.name === 'spawnexteriorcasa');
    this.setupPlayer(
        (spawnObj ? spawnObj.x : 100) + offsetX, 
        (spawnObj ? spawnObj.y : 100) + offsetY
    );
    
    // Adiciona o collider aqui caso o player tenha sido criado depois da camada
    this.physics.add.collider(this.player, this.map.getLayer('Colisao').tilemapLayer);


    // 5. Zona de Evento (Versão Debug) 
    const zonaObj = this.map.findObject('Eventos', obj => obj.name === 'Eventos');

    // Zona Casa 1 (Vizinho)
    // Criei as zonas físicas (retângulos invisíveis) para os diálogos
    const zonaC1 = this.map.findObject('casa1', obj => obj.name === 'zona_casa1');
    if (zonaC1) {
        this.zonaC1 = this.add.rectangle(zonaC1.x + offsetX + zonaC1.width/2, zonaC1.y + offsetY + zonaC1.height/2, zonaC1.width, zonaC1.height);
        this.physics.add.existing(this.zonaC1, true);
    }

    // Zona Casa 2 (Abandonada)
    const zonaC2 = this.map.findObject('casa2', obj => obj.name === 'zona_casa2');
    if (zonaC2) {
        this.zonaC2 = this.add.rectangle(zonaC2.x + offsetX + zonaC2.width/2, zonaC2.y + offsetY + zonaC2.height/2, zonaC2.width, zonaC2.height);
        this.physics.add.existing(this.zonaC2, true);
    }

if (zonaObj) {
    // Desenha um retângulo visível para sabermos se ele está no sítio certo
    this.zonaDialogo = this.add.rectangle(
        zonaObj.x + offsetX + zonaObj.width / 2, 
        zonaObj.y + offsetY + zonaObj.height / 2, 
        zonaObj.width, 
        zonaObj.height, 
    );
    this.physics.add.existing(this.zonaDialogo, true);
    console.log("Zona de diálogo criada em:", this.zonaDialogo.x, this.zonaDialogo.y);
} else {
    console.warn("Atenção: Objeto 'zona_dialogo_casa' não encontrado na camada 'Eventos'!");
}

        // --- Zona de Saída para a Floresta ---
        const objSaida = this.map.findObject('Eventos2', obj => obj.name === 'GoFlorest');
        if (objSaida) {
            this.zonaSaida = this.add.rectangle(
                objSaida.x + offsetX + objSaida.width / 2, 
                objSaida.y + offsetY + objSaida.height / 2, 
                objSaida.width, 
                objSaida.height
            );
            this.physics.add.existing(this.zonaSaida, true);
        }

    // Câmara
    // Limita a câmara ao tamanho do mapa e faz com que ela siga o jogador
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels + offsetX * 2, this.map.heightInPixels + offsetY * 2);
    // 0.1, 0.1 significa a suavização (lerp). A câmara demora 10% do caminho a cada frame para chegar ao player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    

    
}

update() {
        if (!this.player) return;

        if (this.estaAValar) {
        this.player.setVelocity(0);
        this.player.anims.stop();
        return;
    }

    // Colisão Dona (A original)
    if (this.zonaDialogo && !this.jaFalouSobreDona && this.physics.overlap(this.player, this.zonaDialogo)) {
        this.jaFalouSobreDona = true;
        this.iniciarDialogo(["Não... o jardim está deserto.", "Ela realmente não está em lugar nenhum.", "Vou continuar a procurar."]);
    }

    // Colisão Casa 1
    if (this.zonaC1 && !this.jaFalouC1 && this.physics.overlap(this.player, this.zonaC1)) {
        this.jaFalouC1 = true;
        this.iniciarDialogo(["Para lá, é a casa do vizinho...", "Ele normalmente não fala com ninguém."]);
    }

    // Colisão Casa 2
    if (this.zonaC2 && !this.jaFalouC2 && this.physics.overlap(this.player, this.zonaC2)) {
        this.jaFalouC2 = true;
        this.iniciarDialogo(["Aquela casa foi abandonada há anos.", "Mais à frente é a Floresta lá é a casa do Hawk...", "Talvez ele saiba o que se passa."]);
    }

        // Verifica transição para a Floresta
const estaNaZona = this.zonaSaida && this.physics.overlap(this.player, this.zonaSaida);

// Uso a propriedade isDown com uma verificação de estado
if (estaNaZona && !this.estaAValar) {
    // Verificamos se a tecla foi pressionada
    if (this.teclaEnter && this.teclaEnter.isDown) {
        this.estaAValar = true;
        this.player.setVelocity(0);
        this.player.anims.stop();
        
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('FlorestaCena');
        });
    }
}

        // Movimentação
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) { this.player.setVelocityX(-160); this.player.anims.play('andar_esquerda', true); }
        else if (this.cursors.right.isDown) { this.player.setVelocityX(160); this.player.anims.play('andar_direita', true); }
        else if (this.cursors.up.isDown) { this.player.setVelocityY(-160); this.player.anims.play('andar_cima', true); }
        else if (this.cursors.down.isDown) { this.player.setVelocityY(160); this.player.anims.play('andar_baixo', true); }
        else { this.player.anims.stop(); }
    }

    iniciarDialogo(falas) {
    this.estaAValar = true;
    this.player.setVelocity(0);
    this.player.anims.stop();
    let index = 0;

    const mostrarProximaFala = () => {
        if (index < falas.length) {
            this.dialogueManager.falar(falas[index], 'sad');
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



