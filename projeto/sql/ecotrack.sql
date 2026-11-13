CREATE DATABASE IF NOT EXISTS ecotrack
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecotrack;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('usuario', 'admin') NOT NULL DEFAULT 'usuario',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pontos_coleta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    endereco VARCHAR(200) NOT NULL,
    materiais VARCHAR(255) NOT NULL,
    horario VARCHAR(120) NOT NULL,
    observacoes TEXT,
    criado_por INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ponto_usuario FOREIGN KEY (criado_por)
        REFERENCES usuarios(id) ON DELETE SET NULL
);

INSERT INTO pontos_coleta (nome, endereco, materiais, horario, observacoes) VALUES
('Ecoponto Central', 'Rua das Flores, 120', 'Papel, plástico, metal e vidro', 'Segunda a sexta, 8h às 17h', 'Levar os materiais limpos e secos.'),
('Coleta do Bairro', 'Avenida Brasil, 450', 'Papelão e plástico', 'Sábado, 9h às 12h', 'Não recebe resíduos orgânicos.');

-- Sugestões de novos pontos enviadas pelos usuários para análise administrativa.
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
