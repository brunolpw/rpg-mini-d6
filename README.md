# Mini-d6 RPG (v2.5)

Um sistema de RPG de mesa minimalista (*rules-light*), tático e ágil, criado por **Bruno La Porta Welausen**. O projeto foi concebido para priorizar a narrativa, o combate tático fluido e a agilidade de preparação, utilizando **exclusivamente dados comuns de seis faces (d6)**.

---

## 🎯 Visão Geral & Filosofia

O **Mini-d6** foi desenvolvido para resolver a sobrecarga de regras e tabelas dos RPGs tradicionais sem abrir mão da emoção das escolhas táticas.

* **Apenas d6:** Adeus dados poliédricos difíceis de encontrar. Tudo se resolve com dados comuns de 6 faces (rolagens de 1d6, 3d6, 4d6 e a convenção de *d3/d-curto*).
* **Curva de Probabilidade Consistente:** O motor central utiliza **3d6 + Atributo**, gerando uma curva em sino que premia a especialização e reduz a aleatoriedade extrema do d20.
* **Criação Rápida de Ficha:** Personagens prontos em menos de 5 minutos com distribuição simétrica de vantagens e desvantagens.
* **Pronto para Mesas Clássicas, One-Shots ou Modo Solo:** Inclui regras dedicadas de descanso e eventos aleatórios para jogo solo sem mestre.

---

## ⚙️ Mecânicas Principais

### 1. Três Atributos Universais
* **Corpo:** Força muscular, vigor, atletismo, capacidade de absorção de dano físico e PV básico.
* **Mente:** Agilidade motora, velocidade, destreza manual, iniciativa, esquiva e percepção reflexiva.
* **Espírito:** Inteligência, poder místico, fé, força de vontade, Defesa Mágica e reserva de Pontos de Poder (PP).

### 2. Defesa vs. Redução de Dano
O sistema separa de maneira elegante o ato de evitar o golpe da absorção do impacto:
* **Defesa Física:** $10 + \text{Corpo} + \text{Escudo}$ (ou baseada em $\text{Espírito}$ via *Escudo Arcano*).
* **Defesa Mágica:** $10 + \text{Espírito}$.
* **Armaduras:** Não aumentam a Defesa da ficha; em vez disso, concedem **Resistência Física** fixa (reduzem diretamente o dano de golpes que acertam).

### 3. Críticos Visuais e Triplos Caóticos (v2.5)
* **Sucesso Crítico (dois dados 6):** Acerto automático que ignora a Defesa e garante dano máximo em um dado ou vantagem tática na cena (~7,41%).
* **Crítico Caótico `[6, 6, 6]`:** Ápice heroico — ignora resistências e armaduras, dobra o dano máximo e provoca efeitos devastadores (destrói coberturas, derruba ou desarma).
* **Falha Crítica (dois dados 1):** Falha automática com complicação imediata (~7,41%).
* **Desastre Caótico `[1, 1, 1]`:** Revés catastrófico (arma quebra ou voa longe, refluxo mágico causando dano no conjurador).
* **Proezas Menores (`[2,2,2]`, `[3,3,3]`, `[4,4,4]`, `[5,5,5]`):** Sucesso normal acompanhado de um momento épico menor (+1 PP recuperado, 2m de movimento sem Golpe de Oportunidade ou +1 Defesa).

---

## 🧙‍♂️ Raças e Classes

### 7 Raças Clássicas
* **Humano:** Versátil, ganha perícia adicional ou bônus equilibrado.
* **Anão:** Robusto, bônus em Corpo e resistência a venenos.
* **Elfo:** Ágil e místico, sentidos aguçados e imunidade a sono mágico.
* **Orc:** Força bruta e vigor imponente em combate corpo a corpo.
* **Pequenino:** Furtivo, sortudo e ágil para escapar do perigo.
* **Gnomo:** Engenhoso, inventivo e com mente aguçada para arcanismo.
* **Draconato:** Linhagem dracônica com baforada elemental e escamas resistentes.

### 9 Classes Balanceadas
Cada classe conta com estilo definido, regras de PV/PP e árvores de poderes nos Níveis 1, 2 e 3:

| Classe | Foco Principal | Estilo |
| :--- | :--- | :--- |
| **Bárbaro** | Dano físico massivo, Fúria e absorção corporal | Físico (Corpo a Corpo) |
| **Guerreiro** | Mestre em táticas de armas, manobras e liderança | Físico (Versátil) |
| **Paladino** | Campeão sagrado combinando armas pesadas e auras divinas | Físico / Mágico |
| **Mago** | Manipulador de magias arcanas destrutivas e utilitárias | Mágico |
| **Druida** | Guardião elemental, controle ambiental e metamorfose animal | Mágico / Suporte |
| **Clérigo** | Sacerdote de linha de frente focado em curas, bênçãos e punição | Mágico / Físico |
| **Ladino** | Ataques furtivos, infiltração, truques sujos e esquiva ágil | Físico / Distância |
| **Ranger** | Atirador de elite, sobrevivência selvagem e mestre das feras | Distância / Físico |
| **Bardo** | Canções inspiradoras, trapaça social e suporte místico | Suporte / Mágico |

---

## 📂 Estrutura do Repositório

* **[`mini-d6 v2.5.md`](./mini-d6%20v2.5.md):** Manual completo de regras, criação de personagem, bestiário (níveis 1 a 10+), itens mundanos e lendários (*Dysenai*) e ficha oficial editável.
* **[`proposta_progressao_poderes.md`](./proposta_progressao_poderes.md):** Documento detalhado de design e balanceamento com a justificativa de impacto de todos os poderes de nível 2 e 3.
* **[`tabela_atributos_classes.csv`](./tabela_atributos_classes.csv):** Planilha com dados comparativos de atributos base, mínimos, máximos, PV e PP de todas as classes para modelagem em Excel/Calc.
* **[`tabela_atributos_classes.md`](./tabela_atributos_classes.md):** Versão formatada em markdown com considerações e impacto dos bônus raciais.

---

## 🚀 Como Começar a Jogar

1. Baixe ou leia o arquivo [`mini-d6 v2.5.md`](./mini-d6%20v2.5.md).
2. Separe de 3 a 4 dados de seis faces convencionais ($d6$).
3. Distribua os atributos do seu personagem seguindo a tabela da sua classe (+2 pontos em vantagens e -2 pontos em desvantagens).
4. Copie o modelo da ficha no final do livro e comece sua jornada!

---

## 📜 Licença e Créditos

Desenvolvido por **Bruno La Porta Welausen**.  
Contribuições, sugestões de balanceamento e aventuras solos são bem-vindas!
