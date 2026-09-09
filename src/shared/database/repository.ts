import type {
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from "typeorm";

export const getRepository = <T extends ObjectLiteral>(
  manager: EntityManager,
  entity: EntityTarget<T>,
): Repository<T> => {
  return manager.getRepository(entity);
};
