USE ecotrack;

CREATE TABLE IF NOT EXISTS solicitacoes_pontos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome_usuario VARCHAR(100) NOT NULL,
    email_usuario VARCHAR(150) NOT NULL,
    nome_ponto VARCHAR(120) NOT NULL,
    endereco VARCHAR(200) NOT NULL,
    cidade VARCHAR(120) NOT NULL,
    materiais TEXT NOT NULL,
    horario VARCHAR(120) NOT NULL,
    telefone VARCHAR(40) DEFAULT '',
    detalhes TEXT,
    status ENUM('pendente', 'em análise', 'aprovada', 'recusada') NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_solicitacao_usuario FOREIGN KEY (usuario_id)
      REFERENCES usuarios(id) ON DELETE CASCADE
);
