import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from './../pokemon/entities/pokemon.entity'; 
import { PokeResponse } from './interfaces/poke-response.interface';
import { AxiosAdapter } from './../common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) { }

  /** Poblar coleccion pokemon */
  async executeSeed() {
    /** Limpiamos la Coleccion */
    await this.pokemonModel.deleteMany({});
    /** Hacemos la peticion a la api */
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    /** Definimos la estructura del array */
    const pokemonToInsert: { name: string, no: number }[] = [];
    /** Recorremos el resultado de la consulta */
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      /** Lenamos el array */
      pokemonToInsert.push({ no, name });
    });
    /** Guardamos todos los datos del array */
    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'Seed executed';
  }
}
