# 🐾 petvida-clinica

![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-green)
![HTML5](https://img.shields.io/badge/HTML5-CSS3-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-yellow)

Sistema web de **agenda inteligente e prontuário digital** para a clínica **PetVida & Estética Animal**.
Estudo de Caso 5 — Design Profissional (Produção de Portfólio & Desenvolvimento Empresarial).


## 1. Briefing do problema

A PetVida (Dr. Gabriel Santos e Dra. Camila Paes; 2 veterinários plantonistas, 3 tosadores, 2 recepcionistas) controla consultas e banhos em agenda de papel. Com mais de 30 banhos por dia surgem: **choques de horários**, **tutores que esquecem vacinas e banhos** (gerando horários ociosos e perda de receita), e **tempo perdido procurando prontuários** em pastas físicas.

| Dor do cliente | Solução no sistema |
| --- | --- |
| Choque de horários | Validação automática por profissional e por pet, com sugestão do próximo horário livre |
| Esquecimento de vacina/banho | Painel de lembretes com mensagem de WhatsApp pronta |
| Horários ociosos | Agenda mostra ocupação (%) e janelas livres clicáveis |
| Prontuário em papel | Ficha digital com vacinas, anotações e histórico (saúde + estética) e busca rápida |

## 2. Justificativa da solução: Web App / Dashboard

- **Recepção:** uma tela única, visual e rápida, no computador que já existe; sem instalação.
- **Tutores:** acesso por link no navegador, sem baixar app (menor barreira que um aplicativo móvel).
- **Custo:** zero. Hospedagem gratuita no GitHub Pages e nenhuma licença de terceiros.
- **Diferencial:** unifica clínica e estética no mesmo histórico do pet, reforçando a confiança que as redes de pet shop não têm.

## 3. Telas (wireframe)

1. **Agenda:** grade horária (08h–18h) × profissionais; células livres/ocupadas.
2. **Agendar:** pet, serviço, profissional, data e hora; alerta de conflito.
3. **Pets e Prontuário:** busca, ficha do pet, vacinas, anotações e histórico.
4. **Lembretes:** vacinas atrasadas/a vencer e confirmações de amanhã.
5. **Perfil Tutor:** visão restrita aos próprios pets e agendamentos.

![Agenda](docs/screenshots/Captura%20de%20tela%202026-10-05%20230009.png)
![Agendar](docs/screenshots/Captura%20de%20tela%202026-10-05%20230015.png)
![Prontuário](docs/screenshots/Captura%20de%20tela%202026-10-05%20230022.png)
![Lembretes](docs/screenshots/Captura%20de%20tela%202026-10-05%20230028.png)

## 4. Arquitetura e tecnologias

- HTML5, CSS3 e JavaScript puro (sem dependências nem build).
- Persistência no `localStorage` do navegador (demo). Evolução: API + banco de dados.
- Lógica central em `js/app.js`: `conflict()` valida sobreposição de intervalos; `nextFree()` sugere vagas.

```
petvida-clinica/
├── index.html
├── css/style.css
├── js/app.js
├── docs/screenshots/
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

## 5. Instalação e execução

```bash
git clone https://github.com/marcelooluz/petvida-clinica.git
cd petvida-clinica
# opção A: abra o index.html no navegador
# opção B: servidor local
python3 -m http.server 8000   # acesse http://localhost:8000
```

**Publicar:** no GitHub, *Settings → Pages → Deploy from a branch → main / (root)*.

**Segurança:** a demo não usa segredos. Para integrações futuras, copie `.env.example` para `.env` (já ignorado pelo `.gitignore`) e nunca versione chaves.

## 6. Roadmap

Backend com login real, lembretes automáticos via API oficial do WhatsApp, lista de espera para preencher cancelamentos e relatórios de receita.

## 7. Licença e autor

Distribuído sob a licença [MIT](LICENSE).

**Autor:** Marcelo Da Luz
