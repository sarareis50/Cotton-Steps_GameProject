#  CottonSteps: A Jornada de Cotton

## Link do Jogo:
* https://sarareis50.github.io/Cotton-Steps_GameProject/

## Descrição do Projeto
**CottonSteps** é uma aventura narrativa interativa desenvolvida em **Phaser 3**.  
O jogador assume o papel de **Cotton**, uma gata que, após um evento perturbador, desperta num mundo estranhamente silencioso. A sua jornada pela floresta não é apenas uma busca física pela sua Dona, mas um mergulho emocional no processo de luto, negação e, finalmente, aceitação. Através de mecânicas de exploração e diálogos enigmáticos, o jogo explora a força dos laços que transcendem o plano físico.

---

##  Instruções de Execução
Para jogares localmente no teu computador:

1. **Requisitos:** Certifica-te de que tens o Visual Studio Code instalado.
2. **Descarregar:** Abre a pasta do projeto no teu terminal (ou clona o repositório).
3. **Servidor Local:** Como o jogo utiliza ficheiros JSON e assets externos, deverás usar um servidor local para evitar erros de CORS. Se usas o VS Code, a extensão **Live Server** é a opção recomendada.
4. **Executar:** Abre o ficheiro `index.html` através do servidor local e o jogo carregará no teu navegador.
5. **Jogar:** Clica em **"Novo jogo"** para começar a jogar!

---

##  Desafios Implementados
O projeto foca-se na imersão narrativa e técnica:

* **Fluxo de Narrativa Dinâmica:** Sistema de introdução com *skip* (tecla `E`) utilizando uma barra de progresso visual.
* **Mecânica de "Consciência":** Integração de um personagem guia (Hawk) que conduz o diálogo através de estados emocionais.
* **Imersão Sensorial:** Efeitos visuais de pulsação de tela (*overlay* de dor) para representar o trauma psicológico da personagem.
* **Narrativa Estética:** Uso de fontes tipográficas e efeito *typewriter* com feedback sonoro (*beep*) para criar uma atmosfera de revelação.
* **Gestão de Estados:** Sistema de transição entre cenas com *fades* controlados e bloqueio de input para momentos de maior peso dramático.

---

##  Créditos de Assets
* **Motor de Jogo:** [Phaser 3](https://phaser.io/)
* **Tipografia:** [Spectral](https://fonts.google.com/specimen/Spectral) (Google Fonts)
* **Design de Som:** [freesound.org](https://freesound.org/) | [pixabay.com](https://pixabay.com/)
* **Arte / Sprites:** [Tiled](https://www.mapeditor.org/) | [itch.io](https://itch.io/) | [booth.pm](https://booth.pm/)

---

##  Reflexão: Dificuldades e Aprendizagens
O desenvolvimento de **CottonSteps** foi uma jornada de constante superação, equilibrando os desafios técnicos da programação em Phaser 3 com a delicadeza de contar uma história de luto.

A minha principal dificuldade técnica foi a gestão do ciclo de vida das cenas. Garantir que o mapa da floresta (Tiled) carregasse corretamente enquanto mantinha a consistência dos assets e a lógica de estados (como o bloqueio de input durante diálogos) exigiu uma curva de aprendizagem elevada. Além disso, o carregamento de ficheiros externos e a superação de erros de CORS foram obstáculos que me obrigaram a compreender melhor como os navegadores gerem a segurança de dados locais.

Narrativamente, o maior desafio foi equilibrar a mecânica de jogo com a emoção. Queria que o jogador sentisse o peso da jornada da Cotton sem recorrer a explicações excessivas. Implementar o sistema de *typewriter* com feedback sonoro e o efeito de pulsação de tela (*tweening*) foram as aprendizagens mais valiosas, pois percebi como pequenos detalhes audiovisuais podem transformar um simples texto num momento de grande carga dramática.

Este projeto permitiu-me crescer como programador e contadora de histórias. Aprendi que, no desenvolvimento de jogos, a técnica serve um propósito maior: a imersão. Compreendi a importância de planear a arquitetura das cenas antes de codificar e, acima de tudo, aprendi que um jogo com uma narrativa coesa é muito mais impactante do que um sistema apenas funcional. Sinto-me muito mais confiante para aplicar estas competências em futuros projetos :D!

---

> *Um jogo desenvolvido com muito carinho por **Sara Andrade** para explorar a linha ténue entre a perda e a memória.*