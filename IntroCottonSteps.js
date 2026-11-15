class IntroCottonSteps extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroCottonSteps' });
    }

    preload() {
        // Carrega a música de fundo com o nome correto
        this.load.audio('musicaIntro', 'assets/audio/intro_music.mp3');
    }

    create() {
        // Toca a música em loop e com um volume confortável para não abafar a atmosfera
        this.somFundo = this.sound.add('musicaIntro', { volume: 0.4, loop: true });
        this.somFundo.play();

        this.frases = [
            "Dizem que os gatos têm sete vidas...",
            "Mas o mundo ficou silencioso de repente.",
            "Um estrondo... e um sobressalto no escuro.",
            "Lá fora, uma voz distante chama pelo meu nome...",
            "Preciso de me levantar. Preciso de ver o que se passa.",
            "COTTON"
        ];

        this.indice = 0;

        // CONFIGURAÇÃO DA LETRA: Usa a 'Spectral' em itálico e com tamanho 42px
        this.textoNarracao = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            '',
            {
                fontFamily: "'Spectral', serif",
                fontSize: '21px',
                fill: '#fcfaf0',
                fontStyle: 'italic',
                align: 'center',
                lineSpacing: 15,
                wordWrap: { width: this.cameras.main.width * 0.75 }
            }
        ).setOrigin(0.5);

        // Adiciona a sombra suave nas letras
        this.textoNarracao.setShadow(2, 2, 'rgba(0,0,0,0.5)', 8);

        // Sistema de interrupcao (SEGURAR "E" PARA SALTAR)
        // Mapeia a tecla E no teclado
        this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        
        this.tempoSegurando = 0;
        this.tempoNecessario = 1500; // Tempo em milissegundos (1.5 segundos)
        this.jaSaltou = false;       // Gatilho de segurança

        // Texto informativo no canto inferior direito
        this.textoSkip = this.add.text(
            this.cameras.main.width - 20, 
            this.cameras.main.height - 20, 
            "[ Segura 'E' para saltar ]", 
            {
                fontFamily: "'Spectral', serif",
                fontSize: '12px',
                fill: '#fcfaf0',
                fontStyle: 'italic'
            }
        ).setOrigin(1, 1).setAlpha(0.4);

        // Cria a componente gráfica para desenhar a barra de progresso amarela
        this.barraSkipGraphics = this.add.graphics();

        // Inicia a exibição das frases
        this.gerirFrases();
    }

    update(time, delta) {
        // Se a transição de salto já tiver sido ativada, ignora o ciclo do update
        if (this.jaSaltou) return;

        // Limpa o frame anterior da barra
        this.barraSkipGraphics.clear();

        // Se a tecla "E" estiver a ser pressionada neste exato momento
        if (this.teclaE.isDown) {
            // Soma o progresso com base no tempo real de atualização do jogo (delta)
            this.tempoSegurando += delta;
            
            // Destaca visualmente o texto de aviso
            this.textoSkip.setAlpha(1);

            // Calcula o percentual e desenha a barra amarela clara (estilo olhos da Cotton)
            const progresso = Math.min(this.tempoSegurando / this.tempoNecessario, 1);
            const larguraMaxBarra = 90;
            
            this.barraSkipGraphics.fillStyle(0xfaf3ad, 0.85); 
            this.barraSkipGraphics.fillRect(
                this.cameras.main.width - 20 - larguraMaxBarra, 
                this.cameras.main.height - 15, 
                larguraMaxBarra * progresso, 
                2
            );

            // Condição de sucesso: Segurou pelo tempo necessário
            if (this.tempoSegurando >= this.tempoNecessario) {
                this.saltarIntroducao();
            }
        } else {
            // Se o utilizador soltar a tecla, a barra esvazia rapidamente em contagem decrescente
            if (this.tempoSegurando > 0) {
                this.tempoSegurando -= delta * 2;
                if (this.tempoSegurando < 0) this.tempoSegurando = 0;
            }
            this.textoSkip.setAlpha(0.4);
        }
    }

    saltarIntroducao() {
        this.jaSaltou = true;

        // Limpa e remove todas as animações (tweens) e chamadas pendentes desta cena
        this.tweens.killTweensOf(this.textoNarracao);
        if (this.timerFrase) this.timerFrase.remove();

        // Fade Out rápido de áudio e imagem para ser uma transição reativa (0.5 segundos)
        this.tweens.add({
            targets: this.somFundo,
            volume: 0,
            duration: 500
        });

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.somFundo.stop();
           this.scene.start('CasaCima'); // Transição imediata para o Gameplay
        });
    }

    gerirFrases() {
        // Interrompe o fluxo normal de frases se o jogador tiver ativado o skip
        if (this.jaSaltou) return;

        if (this.indice >= this.frases.length) {
            this.tweens.add({
                targets: this.somFundo,
                volume: 0,
                duration: 1500
            });

            this.cameras.main.fadeOut(1500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.somFundo.stop();
                this.scene.start('CasaCima');
            });
            return;
        }

        this.textoNarracao.setText(this.frases[this.indice]);
        this.textoNarracao.setAlpha(0);

        this.tweens.add({
            targets: this.textoNarracao,
            alpha: 1,
            duration: 1000, 
            onComplete: () => {
                // Guarda a referência do delay para o sistema conseguir cancelá-lo no skip
                this.timerFrase = this.time.delayedCall(3000, () => {
                    if (this.jaSaltou) return;

                    this.tweens.add({
                        targets: this.textoNarracao,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            this.indice++;
                            this.gerirFrases(); 
                        }
                    });
                });
            }
        });
    }
}