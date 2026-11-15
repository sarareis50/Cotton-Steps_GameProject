class CasaCima extends BaseScene {
    constructor() { super('CasaCima'); }

    preload() {
        super.preload();
        this.load.tilemapTiledJSON('mapa_cima', 'assets/tiled/casa_andar2_cotton.JSON');

        this.load.image('icone_chave', 'assets/imagens/itens/chave.png');

        this.load.audio('som_chave', 'assets/audio/grabkeys.mp3'); // Ajusta o nome do ficheiro se for diferente

        this.load.audio('text_beep', 'assets/audio/bleep026.ogg');

        const path = 'assets/imagens/CASA_COTTON_PARTES/'; 
        this.load.image('img_floors', path + 'TopDownHouse_FloorsAndWalls.png');
        this.load.image('img_doors', path + 'TopDownHouse_DoorsAndWindows.png');
        this.load.image('img_furn1', path + 'TopDownHouse_FurnitureState1.png');
        this.load.image('img_furn2', path + 'TopDownHouse_FurnitureState2.png');
        this.load.image('img_floors_open', path + 'TopDownHouse_FloorsAndWalls_OpenDoors.png'); 
        this.load.image('img_small', path + 'TopDownHouse_SmallItems.png');
    }

    create(data) {
    // 1. ATRIBUIÇÃO CORRETA: Só fazemos isto uma vez!
    this.map = this.configurarMapa('mapa_cima');

    this.iniciarMusicaGlobal();

    this.zonas = []; 
    this.cooldownInteracao = 0;

    // --- FLAG DE CONTROLO ---
    if (this.registry.get('introducaoVista') === undefined) {
        this.registry.set('introducaoVista', false);
    }
    
    this.dialogueManager = new DialogueManager(this);
    this.dialogueAberto = false;
    
    let posSpawn = (data && data.x !== undefined) ? data : this.buscarCoordenadasObjeto('spawn');
    if (!posSpawn) posSpawn = { x: 100, y: 100 };

    this.setupPlayer(posSpawn.x, posSpawn.y);

    // --- CORREÇÃO NA ESCADA ---
this.configurarZonaInteracao('escadadescer', 'escadadescer', () => { 
    this.dialogueAberto = true; 
    this.dialogueManager.pergunta("Descer?", 'neutra', () => { 
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('CasaBaixo', { x: 200, y: 200 });
        });
    }, () => { this.dialogueAberto = false; });
});


this.zonas.push({
    x: this.zonaInteracao.x + (this.zonaInteracao.width / 2),
    y: this.zonaInteracao.y + (this.zonaInteracao.height / 2),
    callback: () => {
        // Chamo o mesmo callback que define acima na configuração
        if (this.zonaInteracao.callback) this.zonaInteracao.callback();
    }
});
    

    // Uso a sua camada 'secretaria' e o nome do objeto 'pegar'
const objSecretaria = this.map.findObject('secretaria', (o) => o.name === 'pegar');

if (objSecretaria) {
    // Em vez de um rectângulo invisível, guardo o objeto como um ponto de referência
    this.secretariaPos = { x: objSecretaria.x, y: objSecretaria.y };
    
    // Adiciono um objecto "meta" à lista de zonas, mas com lógica de distância
    this.zonas.push({
        x: objSecretaria.x,
        y: objSecretaria.y,
        callback: () => {
    if (!this.registry.get('temChave')) {
        this.registry.set('temChave', true);
        this.exibirItemObtido('icone_chave', 'Chave da porta principal obtida!');
    } else {
        // GARANTE QUE O DIALOGUE ABERTO ESTÁ TRUE
        this.dialogueAberto = true; 
        
        // Exibe a mensagem
        this.dialogueManager.falar("Já não há nada aqui.", 'neutra');

        // Adiciona um evento único para fechar ao clicar ENTER
        this.input.keyboard.once('keydown-ENTER', () => {
            this.dialogueManager.esconder(); // Se o seu manager tiver essa função
            this.dialogueAberto = false;     // LIBERA O JOGADOR
            this.cooldownInteracao = 30;     // Evita re-abrir instantaneamente
        });
    }
}
    });
}

    if (this.camadaDeColisaoTiles) {
        this.physics.add.collider(this.player, this.camadaDeColisaoTiles);
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 50);
    this.teclaEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.cameras.main.setZoom(1.3); 

    const largura = this.cameras.main.width;
    const altura = this.cameras.main.height;
    this.add.rectangle(largura/2, 40, largura, 80, 0x000000).setScrollFactor(0).setDepth(2000);
    this.add.rectangle(largura/2, altura - 40, largura, 80, 0x000000).setScrollFactor(0).setDepth(2000);

    // --- DIÁLOGO INICIAL (USANDO REGISTRY) ---
    if (!this.registry.get('introducaoVista')) {
        this.dialogueAberto = true;
        this.dialogueManager.falar("AH! Que susto... foi apenas um sonho. Deve estar a ficar cansada...", 'neutra');

        const lidarComEnter = () => {
            const pulou = this.dialogueManager.pular();
            if (!pulou) {
                this.input.keyboard.off('keydown-ENTER', lidarComEnter);
                this.dialogueManager.falar("Melhor ir ter com a minha dona.", 'happy');
                
                this.input.keyboard.once('keydown-ENTER', () => {
                    this.dialogueManager.esconder();
                    this.dialogueAberto = false;
                    // MARCO NO REGISTRO GLOBAL
                    this.registry.set('introducaoVista', true);
                });
            }
        };
        this.input.keyboard.on('keydown-ENTER', lidarComEnter);
    } else {
        this.dialogueAberto = false;
    }
}

exibirItemObtido(imagemChave, texto) {
    this.dialogueAberto = true; 

    this.sound.play('som_chave');
    // 1. Fundo escurecido
    const fundo = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, 
                                     this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
                          .setScrollFactor(0).setDepth(3000);
    
    // 2. CHAVE:  grande e centralizada
    const img = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY - 20, imagemChave)
                        .setScrollFactor(0)
                        .setDepth(3001);
    img.displayWidth = 200; // Tamanho grande e imponente
    img.displayHeight = 200;

    // 3. LEGENDA: Pequena, muito abaixo, e garantindo alinhamento central absoluto
const txt = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 180, texto, {
    fontSize: '16px', 
    color: '#CCCCCC', 
    fontFamily: 'Arial',
    align: 'center' // Garante que o texto dentro da caixa esteja centralizado
})
.setOrigin(0.5, 0.5) // Garante que o ponto central do objeto de texto é o (x, y)
.setScrollFactor(0)
.setDepth(3001);

    // Evento de fecho
    this.input.keyboard.once('keydown-ENTER', () => {
        fundo.destroy();
        img.destroy();
        txt.destroy();
        this.dialogueAberto = false;
        this.cooldownInteracao = 30;
    });
}

    update() {
        if (this.dialogueAberto) {
            this.player.setVelocity(0);
            this.player.anims.stop();

            if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
                this.dialogueManager.moverSelecao();
            }

            if (Phaser.Input.Keyboard.JustDown(this.teclaEnter)) {
                this.dialogueManager.confirmar();
                this.dialogueAberto = false;
            }
            return;
        }

        const velocidade = 160;
        this.player.setVelocity(0); 

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-velocidade);
            this.player.anims.play('andar_esquerda', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(velocidade);
            this.player.anims.play('andar_direita', true);
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-velocidade);
            this.player.anims.play('andar_cima', true);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(velocidade);
            this.player.anims.play('andar_baixo', true);
        } else {
            this.player.anims.stop();
        }

        // --- VERIFICAÇÃO DE ZONAS POR DISTÂNCIA ---
if (this.cooldownInteracao > 0) this.cooldownInteracao--;

// Adiciono a verificação: só interage se o cooldown for zero E estiver perto
if (!this.dialogueAberto && this.cooldownInteracao === 0 && Phaser.Input.Keyboard.JustDown(this.teclaEnter)) {
    
    const distanciaMinima = 35; // Valor mais restrito
    
    // Procura a zona mais próxima
    const zonaAtiva = this.zonas.find(z => {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, z.x, z.y);
        return d < distanciaMinima;
    });

    if (zonaAtiva) {
        // Dispara o callback apenas se encontrou uma zona dentro do limite
        zonaAtiva.callback();
        this.cooldownInteracao = 30;
    } else {
        // Se apertei ENTER e não está perto de nada, ignora completamente
        console.log("Nenhuma zona próxima para interagir.");
    }
}
    } 
} 