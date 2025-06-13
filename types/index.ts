// types/index.ts

// --- TIPOS BASE (DEFINIR PRIMEIRO) ---
export type UserType = 'USUARIO' | 'PROFISSIONAL';
export type Gender = 'Masculino' | 'Feminino' | 'Outro';
export type SessionStatus = 'AGENDADA' | 'REALIZADA' | 'CANCELADA' | 'CANCELADA_PACIENTE' | 'CANCELADA_PROFISSIONAL';
export type AppointmentType = 'ONLINE' | 'PRESENCIAL';


// --- ENTIDADES E DTOs ---

// Entidade Usuario (User) - Corresponde ao UsuarioResponseDTO do backend
export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: UserType; // Agora UserType já foi definido
  dataNascimento?: string; // Formato "AAAA-MM-DD"
  genero?: Gender; // Agora Gender já foi definido
  cidade?: string;
  estado?: string;
  tipoNeurodivergencia?: string;
  preferenciasSensoriais?: string;
  modoComunicacao?: string;
  historicoEscolar?: string;
  hobbies?: string[];
  // Não inclua a senha aqui por segurança ao lidar com o frontend
}

// DTO de registro para o usuário (não retorna senha)
export interface RegisterUserDTO {
  nome: string;
  email: string;
  senha: string;
  dataNascimento?: string;
  genero?: Gender | null; // Pode ser null no backend
  cidade?: string | null;
  estado?: string | null;
  tipoNeurodivergencia?: string | null;
  preferenciasSensoriais?: string | null;
  modoComunicacao?: string | null;
  historicoEscolar?: string | null;
  hobbies?: string[]; // Pode ser array vazio ou null
  tipo: UserType; // 'USUARIO' ou 'PROFISSIONAL'
}

// DTO para a resposta de login do backend (corresponde a DadosTokenJWT no Java)
export interface DadosTokenJWT {
    token: string;
    usuario: User; // O backend retorna 'usuario', não 'user'
}


// Entidade Profissional
export interface Professional {
  id: number; // ID do perfil profissional
  usuario: User; // O usuário associado ao profissional
  disponibilidade?: string;
  avaliacaoMedia?: number;
  certificacoes?: string[];
  especializacoes?: string[];
  metodosUtilizados?: string[];
  hobbies?: string[]; // Hobbies específicos do perfil profissional
}

// DTO para atualizar perfil profissional
export interface UpdateProfessionalProfileDTO {
  disponibilidade?: string;
  certificacoes?: string[];
  especializacoes?: string[];
  metodosUtilizados?: string[];
  hobbies?: string[];
}


// Entidade Sessao
export interface Session {
  id: number;
  usuario: User;
  profissional: Professional;
  dataHoraAgendamento: string; // Formato ISO 8601, ex: "2025-07-15T14:00:00"
  tipoAtendimento: AppointmentType;
  localOuLink?: string;
  status: SessionStatus;
  observacoesUsuario?: string;
  observacoesProfissional?: string;
  duracaoEstimadaMinutos?: number;
  dataCriacao: string;
  dataUltimaModificacao: string;
}

// DTO para agendar sessão
export interface CreateSessionDTO {
  profissionalId: number;
  dataHoraAgendamento: string;
  tipoAtendimento: AppointmentType;
  localOuLink?: string;
  observacoesUsuario?: string;
  duracaoEstimadaMinutos?: number;
}

// DTO para atualizar status da sessão
export interface UpdateSessionStatusDTO {
  novoStatus: SessionStatus;
  observacoes?: string;
}

// Entidade Avaliacao
export interface Avaliacao {
  id: number;
  profissional: Professional;
  usuario: User;
  nota: number;
  comentario?: string;
  dataAvaliacao: string; // Formato "AAAA-MM-DD"
}

// DTO para criar avaliação
export interface CreateAvaliacaoDTO {
  profissionalId: number;
  nota: number;
  comentario?: string;
  dataAvaliacao?: string; // Pode ser preenchido no backend
}


// Entidade Matching
export interface Matching {
  id: number;
  usuario: User;
  profissional: Professional;
  status: 'SUGERIDO' | 'ACEITO' | 'RECUSADO';
  dataSugestao: string; // Formato "AAAA-MM-DD"
  pontuacao?: number; // Se o backend retornar uma pontuação
}

// Entidade Favorito
export interface Favorito {
  id: number;
  usuario: User;
  profissional: Professional;
}

// DTO para favoritar (se o endpoint exigir)
export interface AddFavoriteDTO {
  profissionalId: number;
}