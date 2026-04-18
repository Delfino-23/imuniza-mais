import Agendamentos from './Agendamentos.js';
import Estoque from './Estoque.js';
import HistoricoVacinal from './HistoricoVacinal.js';
import PostosSaude from './PostosSaude.js';
import Status from './Status.js';
import Vacinas from './Vacinas.js';
import Cidadaos from './Cidadaos.js';

// Agendamentos relations
Agendamentos.belongsTo(PostosSaude, { foreignKey: 'postoId' });
Agendamentos.belongsTo(Vacinas, { foreignKey: 'vacinaId' });
Agendamentos.belongsTo(Status, { foreignKey: 'statusId' });
Agendamentos.belongsTo(Cidadaos, { foreignKey: 'cidadaoId' });

// Estoque relations
Estoque.belongsTo(PostosSaude, { foreignKey: 'postoId' });
Estoque.belongsTo(Vacinas, { foreignKey: 'vacinaId' });

// HistoricoVacinal relations
HistoricoVacinal.belongsTo(Cidadaos, { foreignKey: 'cidadaoId' });
HistoricoVacinal.belongsTo(Vacinas, { foreignKey: 'vacinaId' });
HistoricoVacinal.belongsTo(Agendamentos, { foreignKey: 'agendamentoId' });

