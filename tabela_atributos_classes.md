# Tabela de Atributos, PV e PP das Classes — Mini-d6 (v2.5)

Este documento reúne a compilação completa dos atributos, modificadores de classe, limites mínimos e máximos, e fórmulas de PV e PP para cada uma das 9 classes do sistema **Mini-d6**.

Um arquivo correspondente para planilhas está disponível em [`tabela_atributos_classes.csv`](file:///var/home/bruno/Projetos/RPG%20Mini%20d6/tabela_atributos_classes.csv).

---

## 1. Regras de Cálculo dos Valores

1. **Atributos Base:** Todo personagem inicia com base **5** em Corpo, Mente e Espírito.
2. **Rolagem Mm Inicial:** Rola-se 1 dado d6 para cada atributo:
   * Faces 1, 2, 3 (menor) = **+1**
   * Faces 4, 5, 6 (maior) = **+2**
   * Portanto, a base antes da classe varia entre **6** (5+1) e **7** (5+2).
3. **Modificadores de Classe:** Cada classe possui 2 pontos de bônus e 2 pontos de penalidade distribuídos entre os atributos.
4. **Bônus Raciais (Opcional no cálculo):**
   * **Anão:** +1 em Corpo (teto máximo 10).
   * **Gnomo:** +1 em Espírito (teto máximo 10).
   * **Humano:** +1 em um atributo à escolha (não pode ser o mesmo bônus principal da classe).
   * *(Elfo, Orc, Pequenino e Draconato não concedem bônus numéricos fixos em atributos no nível 1).*
5. **Fórmulas de PV e PP (Opção B - v2.5):**
   * **Classes de Corpo** (Bárbaro, Guerreiro, Paladino):
     * $\text{PV} = Corpo + 2d3 + 1$ (dado varia de 3 a 7)
     * $\text{PP} = Espírito + 1d3 + 1$ (dado varia de 2 a 4)
   * **Classes de Espírito** (Mago, Druida, Clérigo):
     * $\text{PV} = Corpo + 1d3 + 1$ (dado varia de 2 a 4)
     * $\text{PP} = Espírito + 2d3 + 1$ (dado varia de 3 a 7)
   * **Classes de Mente** (Ladino, Ranger, Bardo):
     * $\text{PV} = Corpo + 2d3$ (dado varia de 2 a 6)
     * $\text{PP} = Espírito + 2d3$ (dado varia de 2 a 6)

---

## 2. Tabela Geral de Atributos e Recursos

| Classe | Foco Principal | Mod. C | Mod. M | Mod. E | Corpo (Min-Max) | Mente (Min-Max) | Espírito (Min-Max) | Raça Ideal (+1) | Corpo Max (c/ Raça) | Mente Max (c/ Raça) | Espírito Max (c/ Raça) | Fórmula PV | PV (Min-Max) | PV Max (c/ Raça) | Fórmula PP | PP (Min-Max) | PP Max (c/ Raça) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :---: | :---: | :---: | :--- | :---: | :---: | :--- | :---: | :---: |
| **Bárbaro** | Corpo | +2 | 0 | -2 | **8 – 9** | **6 – 7** | **4 – 5** | Anão (+1 C) | **10** | 7 | 5 | $C + 2d3 + 1$ | **11 – 16** | **17** | $E + 1d3 + 1$ | **6 – 9** | 9 |
| **Guerreiro** | Corpo | +1 | +1 | -2 | **7 – 8** | **7 – 8** | **4 – 5** | Anão (+1 C) / Humano (+1 M) | **9** | **9** | 5 | $C + 2d3 + 1$ | **10 – 15** | **16** | $E + 1d3 + 1$ | **6 – 9** | 9 |
| **Paladino** | Híbrido | +1 | -2 | +1 | **7 – 8** | **4 – 5** | **7 – 8** | Anão (+1 C) / Gnomo (+1 E) | **9** | 5 | **9** | $C + 2d3 + 1$ | **10 – 15** | **16** | $E + 1d3 + 1$ | **9 – 12** | **13** |
| **Mago** | Espírito | -2 | 0 | +2 | **4 – 5** | **6 – 7** | **8 – 9** | Gnomo (+1 E) | 5 | 7 | **10** | $C + 1d3 + 1$ | **6 – 9** | 9 | $E + 2d3 + 1$ | **11 – 16** | **17** |
| **Druida** | Espírito | -1 | 0 | +1 | **5 – 6** | **6 – 7** | **7 – 8** | Gnomo (+1 E) | 6 | 7 | **9** | $C + 1d3 + 1$ | **7 – 10** | 10 | $E + 2d3 + 1$ | **10 – 15** | **16** |
| **Clérigo** | Espírito | 0 | -1 | +1 | **6 – 7** | **5 – 6** | **7 – 8** | Gnomo (+1 E) / Anão (+1 C) | **8** | 6 | **9** | $C + 1d3 + 1$ | **8 – 11** | **12** | $E + 2d3 + 1$ | **10 – 15** | **16** |
| **Ladino** | Mente | -1 | +2 | -1 | **5 – 6** | **8 – 9** | **5 – 6** | Humano (+1 C ou +1 E) | **7** | 9 | **7** | $C + 2d3$ | **7 – 12** | **13** | $E + 2d3$ | **7 – 12** | **13** |
| **Ranger** | Mente | +1 | +1 | -2 | **7 – 8** | **7 – 8** | **4 – 5** | Anão (+1 C) / Humano (+1 M) | **9** | **9** | 5 | $C + 2d3$ | **9 – 14** | **15** | $E + 2d3$ | **6 – 11** | 11 |
| **Bardo** | Mente | -2 | +1 | +1 | **4 – 5** | **7 – 8** | **7 – 8** | Gnomo (+1 E) / Humano (+1 M) | 5 | **9** | **9** | $C + 2d3$ | **6 – 11** | 11 | $E + 2d3$ | **9 – 14** | **15** |

---

## 3. Análise Rápida de Equilíbrio

* **Pontos de Vida (PV):**
  * **Tanques (Bárbaro, Guerreiro, Paladino):** Média de 13 a 14 PV.
  * **Intermediários (Ranger, Clérigo, Ladino, Druida):** Média de 8 a 12 PV.
  * **Frágeis (Mago, Bardo):** Média de 7 a 9 PV.
* **Pontos de Poder (PP):**
  * **Conjuradores Puros (Mago, Druida, Clérigo):** Média de 13 a 14 PP.
  * **Conjuradores de Suporte / Híbridos (Paladino, Bardo):** Média de 11 a 12 PP.
  * **Combatentes Físicos e Especialistas (Bárbaro, Guerreiro, Ranger):** Média de 7 a 9 PP.
