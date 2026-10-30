import { car } from './car';
import { homePage } from './homePage';
import { objectTypes } from './objects';
import { siteSettings } from './siteSettings';
import { vehiclePage } from './vehiclePage';

export const schemaTypes = [...objectTypes, car, siteSettings, homePage, vehiclePage];
