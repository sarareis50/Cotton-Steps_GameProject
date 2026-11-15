class CasaBaixo extends BaseScene {
    constructor() {
        super('CasaBaixo');
    }

    preload() {
        super.preload();
    this.load.tilemapTiledJSON('mapa_baixo', 'assets/tiled/CASA_COTTON.JSON');

    this.load.audio('som_locked', 'assets/audio/lockeddoor.mp3');
    this.load.audio('som_porta', 'assets/audio/portaabrir.mp3');

    const path = 'assets/imagens/CASA_COTTON_PARTES/'; 
    

    this.load.image('img_floors', path + 'TopDownHouse_FloorsAndWalls.png');
    this.load.image('img_doors', path + 'TopDownHouse_DoorsAndWindows.png');
    this.load.image('img_furn1', path + 'TopDownHouse_FurnitureState1.png');
    this.load.image('img_furn2', path + 'TopDownHouse_FurnitureState2.png'); // <-- Importante
    this.load.image('img_small', path + 'TopDownHouse_SmallItems.png');
    }

    create(data) {
        this.map = this.configurarMapa('mapa_baixo'); 
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.iniciarMusicaGlobal();

        // 1. Setup Player
    // Buscamos a camada inteira primeiro
    const camadaSpawn = this.map.getObjectLayer('spawnbaixo'); 
    
    // Agora, dentro dessa camada, o tiled procura o objeto que tem o nome 'spawnbaixo'
    const objSpawn = camadaSpawn ? camadaSpawn.objects.find(o => o.name === 'spawnbaixo') : null;
    
    let x, y;
    if (objSpawn) {
        x = objSpawn.x;
        y = objSpawn.y;
        console.log("Sucesso! Spawn encontrado em:", x, y);
    } else {
        console.warn("Objeto 'spawnbaixo' não encontrado DENTRO da camada 'spawnbaixo'!");
        x = 400; // Valor de fallback
        y = 300;
    }
    
    this.setupPlayer(x, y);

        // 2. Colisão
        if (this.camadaDeColisaoTiles) {
            this.physics.add.collider(this.player, this.camadaDeColisaoTiles);
        }

        // 3. Sistema de Diálogo e Interação
        this.dialogueManager = new DialogueManager(this);
        this.dialogueAberto = false;

        const camadaEscadas = this.map.getObjectLayer('escadas');
const objSubir = camadaEscadas.objects.find(o => o.name === 'subir');

// Criei a zona de física
this.zonaSubir = this.add.rectangle(objSubir.x + objSubir.width/2, objSubir.y + objSubir.height/2, objSubir.width, objSubir.height);
this.physics.add.existing(this.zonaSubir, true); 

this.zonaSubir.setVisible(false);

// IMPORTANTE: Adicionar esta linha para o update reconhecer a zona
this.rectEscadas = this.zonaSubir;


        // 4. Configuração da Câmara
this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
this.cameras.main.setZoom(1.3);

// Tenta seguir, mas apenas se o mapa for maior que o viewport da câmara
if (this.map.widthInPixels > (this.scale.width / 1.3) || this.map.heightInPixels > (this.scale.height / 1.3)) {
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 50); // Deadzone ajuda a não "saltar" nos cantos
} else {
    // Se o mapa for minúsculo, centraliza e não sigas (evita o erro visual)
    this.cameras.main.centerOn(this.map.widthInPixels / 2, this.map.heightInPixels / 2);
}

        // 5. Barras Pretas
        const largura = this.scale.width;
        const altura = this.scale.height;
        this.add.rectangle(largura / 2, 40, largura, 80, 0x000000).setScrollFactor(0).setDepth(2000);
        this.add.rectangle(largura / 2, altura - 40, largura, 80, 0x000000).setScrollFactor(0).setDepth(2000);
        // Cor: Código hexadecimal para Preto.-0X000000
        // Altura: O retângulo tem 80px de altura total.
        // Largura: O retângulo ocupa toda a largura da tela.
        // Y: Posição vertical. Começa no topo e desce 40px para baixo.
        // X: Posição horizontal centralizada (metade da largura da tela)
        //.setScrollFactor(0): Faz com que a barra "cole" à câmara e não se mova com o jogador.
        // .setDepth(2000);: Coloca este objeto à frente de tudo o resto (jogador, mapa, etc).

        // 6. Input e Fade In
        this.cursors = this.input.keyboard.createCursorKeys();
        this.teclaEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // --- ZONA DE OBSERVAÇÃO (MEIO DA SALA) ---
    // Usando as coordenadas exatas que obtiveste
    // O último parâmetro está 0.5 para poder ver a zona enquanto testes. 
    // Quando confirmar que funciona, muda para 0.
    this.zonaObservacao = this.add.rectangle(388.99, 206.66, 47, 32); 
    this.zonaObservacao.setVisible(false);
    this.physics.add.existing(this.zonaObservacao, true);

    // Verifica se já vi a observação no registo global
    this.observacaoFeita = this.registry.get('observacaoFeita') || false;

    // Procura e guarda o retângulo da porta APENAS UMA VEZ
const objPorta = this.map.findObject('portasaida', (o) => o.name === 'portasaida');
if (objPorta) {
    this.rectPorta = new Phaser.Geom.Rectangle(objPorta.x, objPorta.y, objPorta.width, objPorta.height);
}
    }

    fazerObservacao() {
    this.observacaoFeita = true;
    this.registry.set('observacaoFeita', true);
    
    // ATIVA O BLOQUEIO PARA O UPDATE NÃO INTERFERIR
    this.observacaoAutomatica = true; 
    
    this.dialogueAberto = true;
    this.player.setVelocity(0);
    this.player.anims.stop();

    const frases = [
        "Estranho... a casa está muito silenciosa.",
        "Não há ninguém na sala. Onde será que todos foram?",
        "Talvez a dona esteja no jardim... vou ver."
    ];
    let indice = 0;

    const avancarDialogo = () => {
        // Se a animação ainda está a correr, o pular() retorna true
        if (this.dialogueManager.pular()) return;
        
        indice++;
        if (indice < frases.length) {
            this.dialogueManager.falar(frases[indice], 'neutra');
        } else {
            this.dialogueManager.esconder();
            this.dialogueAberto = false;
            this.observacaoAutomatica = false; // LIBERTA O UPDATE
            this.input.keyboard.off('keydown-ENTER', avancarDialogo);
        }
    };

    this.dialogueManager.falar(frases[0], 'neutra');
    this.input.keyboard.on('keydown-ENTER', avancarDialogo);
}



interagirComPorta() {
    this.dialogueAberto = true;
    this.player.setVelocity(0);
    this.player.anims.stop();

    if (this.registry.get('temChave')) {
        this.dialogueManager.falar("A chave funcionou! A porta abriu.", 'happy');
        
        // Aguarda confirmação para tocar o som de sucesso e sair
        this.input.keyboard.once('keydown-ENTER', () => {
            this.dialogueManager.esconder();
            
            // Toca som de porta a abrir
            this.sound.play('som_porta');
            
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('CasaCottonOutside');
                this.dialogueAberto = false;
            });
        });
    } else {
        // Toca som de porta trancada
        this.sound.play('som_locked');
        
        this.registry.set('tentouAbrirPorta', true);
        this.frasesPorta = [
            "Está trancada... Preciso de uma chave.",
            "Talvez a chave esteja na secretária da dona, lá em cima..."
        ];
        this.indiceFrase = 0;

        this.time.delayedCall(100, () => {
            this.dialogueManager.falar(this.frasesPorta[0], 'neutra');
        });
    }
}

    

 update() {
    
    // 1. Verificação da zona de observação
    if (!this.observacaoFeita && this.zonaObservacao && this.physics.overlap(this.player, this.zonaObservacao)) {
        this.fazerObservacao();
    }

    // 2. Lógica de Diálogo
    if (this.dialogueAberto) {
        this.player.setVelocity(0);
        this.player.anims.stop();
        
        if (Phaser.Input.Keyboard.JustDown(this.teclaEnter)) {
            
            // Verifica se é o caso da porta trancada
            if (this.frasesPorta) {
                this.indiceFrase++;
                if (this.indiceFrase < this.frasesPorta.length) {
                    // Mostra a segunda frase
                    this.dialogueManager.falar(this.frasesPorta[this.indiceFrase], 'neutra');
                } else {
                    // Finaliza e limpa tudo
                    this.dialogueManager.esconder();
                    this.dialogueAberto = false;
                    this.frasesPorta = null; // IMPORTANTE: limpa para não entrar aqui de novo
                }
            } 
            // Se NÃO for a porta, mantém o comportamento normal de diálogo
            else if (!this.observacaoAutomatica) {
                this.dialogueManager.confirmar();
            }
        }
        // ---------------------------------
        
        return; // Bloqueia movimento enquanto houver diálogo
    }

    // 3. Lógica de Interação Otimizada
if (this.rectPorta) {
    const estaNaPorta = Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.rectPorta);
    if (estaNaPorta && !this.dialogueAberto && Phaser.Input.Keyboard.JustDown(this.teclaEnter)) {
        this.interagirComPorta(); 
    }
}

// Verifica se o player está a tocar na zona física da escada
if (this.zonaSubir && this.physics.overlap(this.player, this.zonaSubir)) {
    
    // Verifica se carreguei no ENTER
    if (!this.dialogueAberto && Phaser.Input.Keyboard.JustDown(this.teclaEnter)) {
        console.log("Subindo...");
        
        this.dialogueAberto = true;
        this.player.setVelocity(0);
        this.player.anims.stop();
        
        this.dialogueManager.pergunta("Subir?", 'neutra', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('CasaCima', { x: 200, y: 200 });
                // Não preciso de mudar o dialogueAberto aqui, a nova cena reinicia o estado
            });
        }, () => { 
            this.dialogueAberto = false; 
        });
    }
}

    // 4. Movimento
    const velocidade = 160;
    // (Certifica que o setVelocity(0) não está a sobrescrever o movimento se não houver tecla pressionada)
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
 }}
