/**
 * Shared Interfaces Module
 *
 * This file serves as the central registry for global abstractions and cross-cutting contracts
 * within the application. By defining these interfaces here, we ensure:
 *
 * 1. Consistent architectural patterns (UseCases, Repositories) across different domains.
 * 2. Proper Dependency Inversion (SOLID), removing circular dependencies between modules.
 * 3. Shared domain constraints like Authentication definitions (Token, Requester, Roles).
 * 4. Microservice/RPC boundaries for inter-module communication (e.g. IPostRpc, IAuthorRpc).
 *
 * All modules should depend on these interfaces rather than concrete implementations belonging to other feature modules.
 */

import { IEventPublisher } from '@shared/components/redis-pubsub/interface';
import { Paginated, PagingDTO, Post, PublicUser, Topic } from '@shared/model';
import { Handler } from 'express';

// ============================================================================
// Core Architecture Interfaces (Domain & Data Layer)
// ============================================================================

/**
 * Standard Use Case (Business Logic Contract)
 * Generics:
 * - CreateDTO / UpdateDTO: Payload formats for creating/modifying
 * - Entity: The domain model
 * - Cond: Allowed filter criteria
 */
export interface IUseCase<CreateDTO, UpdateDTO, Entity, Cond> {
  create(data: CreateDTO): Promise<string>;
  getDetail(id: string): Promise<Entity | null>;
  list(cond: Cond, paging: PagingDTO): Promise<Paginated<Entity>>;
  update(id: string, data: UpdateDTO): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

/**
 * Command Repository (CQRS Write Operations)
 * Handles mutating state: Insert, Update, Delete.
 */
export interface ICommandRepository<Entity, UpdateDTO, Cond = any> {
  insert(data: Entity): Promise<boolean>;
  update(id: string, data: UpdateDTO): Promise<boolean>;
  delete(id: string, isHard?: boolean): Promise<boolean>;
  deleteByCond?(cond: Cond, isHard?: boolean): Promise<boolean>;
}

/**
 * Query Repository (CQRS Read Operations)
 * Handles non-mutating data fetching.
 */
export interface IQueryRepository<Entity, CondDTO> {
  findById(id: string): Promise<Entity | null>;
  findByCond(condition: CondDTO): Promise<Entity | null>;
  list(cond: CondDTO, paging: PagingDTO): Promise<Paginated<Entity>>;
  listByIds(ids: string[]): Promise<Array<Entity>>;
}

/**
 * Unified Repository (Read & Write)
 * Standard Repository Pattern combining Command and Query operations.
 */
export interface IRepository<Entity, Cond, UpdateDTO> extends IQueryRepository<Entity, Cond>, ICommandRepository<Entity, UpdateDTO, Cond> { }




// ============================================================================
// Authentication & Authorization (Tokens & Roles)
// ============================================================================

/**
 * Global Authorization Scopes.
 * Placed in the shared layer (instead of the User module) to prevent circular dependencies,
 * allowing core middlewares and token decoders to verify permissions holistically.
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

/**
 * Core payload for JWT or session token.
 */
export interface TokenPayload {
  sub: string; // subject/user ID string
  role: UserRole;
}

/**
 * Represents the authenticated user making the current request.
 */
export interface Requester extends TokenPayload { }

/**
 * Contract for generating and verifying authentication tokens.
 */
export interface ITokenProvider {
  // generate access token
  generateToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload | null>;
}

export type TokenIntrospectResult = {
  payload: TokenPayload | null;
  error?: Error;
  isOk: boolean;
};

/**
 * Contract to explicitly check if a token string is valid (e.g., in API Gateways).
 */
export interface ITokenIntrospect {
  introspect(token: string): Promise<TokenIntrospectResult>;
}


// ============================================================================
// CQRS (Command Query Responsibility Segregation) Helpers
// ============================================================================

/**
 * Handles intent to change system state.
 */
export interface ICommandHandler<Command, Result> {
  execute(command: Command): Promise<Result>;
}

/**
 * Handles intent to fetch data without modifying anything.
 */
export interface IQueryHandler<Query, Result> {
  query(query: Query): Promise<Result>;
}


// ============================================================================
// HTTP Middleware & Context
// ============================================================================

/**
 * Factory for creating standard Express authentication routing middlewares.
 */
export interface MdlFactory {
  auth: Handler; // Mandates the user is authenticated.
  optAuth: Handler; // Optional authentication (guest access allowed).
  allowRoles: (roles: UserRole[]) => Handler; // Ensures requester has specific roles.
}

/**
 * Bundled context object containing system-wide dependencies.
 */
export type ServiceContext = {
  mdlFactory: MdlFactory;
  eventPublisher: IEventPublisher;
};


// ============================================================================
// RPC (Remote Procedure Call) Communication between Microservices
// ============================================================================
// Establishes API contracts for how different modules request data from one another
// safely without creating tight/circular dependencies.

export interface IPostRpc {
  findById(id: string): Promise<Post | null>;
  findByIds(ids: Array<string>): Promise<Array<Post>>;
}

/**
 * Defines how other modules safely request Author (PublicUser) data.
 */
export interface IAuthorRpc {
  findById(id: string): Promise<PublicUser | null>;
  findByIds(ids: Array<string>): Promise<Array<PublicUser>>;
}

export interface ITopicRPC {
  findById(id: string): Promise<Topic | null>;
  findAll(): Promise<Array<Topic>>;
}

/**
 * Safe, sanitized PublicUser representation (often identical to IAuthorRpc).
 */
export interface IPublicUserRpc extends IAuthorRpc { }
