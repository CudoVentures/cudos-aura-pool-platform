import VisitorEntity from '../../src/visitor/entities/visitor.entity';
import { v4 as uuidv4 } from 'uuid';
import { miningFarmEntities } from './farm.data';

const visitorEntitiesToExport = []

miningFarmEntities.forEach((entity) => {
    for (let i = 1; i <= entity.id; i++) {
        visitorEntitiesToExport.push(VisitorEntity.newInstanceForMiningFarm(entity.id, uuidv4()));
    }
})

export const visitorEntities = visitorEntitiesToExport;
