export type CharacterSet = 'letters-space' | 'alphanumeric-space' | 'printable-ascii';

export interface Individual {
  dna: string;
  fitness: number;
}

export interface GeneticAlgorithmConfig {
  target: string;
  populationSize: number;
  survivalRate: number; // percentage 1-100
  mutationEnabled: boolean;
  mutationRate?: number; // probability 0-1
  characterSet: CharacterSet;
}

export interface GenerationStats {
  generation: number;
  bestIndividual: Individual;
  averageFitness: number;
  isComplete: boolean;
}

export class GeneticAlgorithm {
  private config: GeneticAlgorithmConfig;
  private population: Individual[] = [];
  private generation: number = 0;
  private characterPool: string = '';

  constructor(config: GeneticAlgorithmConfig) {
    this.config = {
      ...config,
      mutationRate: config.mutationRate ?? 0.01,
    };
    this.setCharacterPool();
  }

  private setCharacterPool(): void {
    switch (this.config.characterSet) {
      case 'letters-space':
        this.characterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
        break;
      case 'alphanumeric-space':
        this.characterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
        break;
      case 'printable-ascii':
        // Printable ASCII characters (space to ~)
        this.characterPool = '';
        for (let i = 32; i <= 126; i++) {
          this.characterPool += String.fromCharCode(i);
        }
        break;
    }
  }

  private getRandomCharacter(): string {
    const index = Math.floor(Math.random() * this.characterPool.length);
    return this.characterPool[index];
  }

  private generateRandomString(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += this.getRandomCharacter();
    }
    return result;
  }

  private calculateFitness(dna: string): number {
    let score = 0;
    for (let i = 0; i < dna.length; i++) {
      if (dna[i] === this.config.target[i]) {
        score++;
      }
    }
    return score;
  }

  initialize(): void {
    this.population = [];
    this.generation = 0;
    const targetLength = this.config.target.length;

    for (let i = 0; i < this.config.populationSize; i++) {
      const dna = this.generateRandomString(targetLength);
      this.population.push({
        dna,
        fitness: this.calculateFitness(dna),
      });
    }
  }

  private selectParent(survivors: Individual[]): Individual {
    const index = Math.floor(Math.random() * survivors.length);
    return survivors[index];
  }

  private crossover(parent1: Individual, parent2: Individual): [string, string] {
    const length = parent1.dna.length;
    const splitPoint = Math.floor(Math.random() * (length - 1)) + 1;

    const child1 = parent1.dna.slice(0, splitPoint) + parent2.dna.slice(splitPoint);
    const child2 = parent2.dna.slice(0, splitPoint) + parent1.dna.slice(splitPoint);

    return [child1, child2];
  }

  private mutate(dna: string): string {
    if (!this.config.mutationEnabled) {
      return dna;
    }

    let mutated = '';
    for (let i = 0; i < dna.length; i++) {
      if (Math.random() < this.config.mutationRate!) {
        mutated += this.getRandomCharacter();
      } else {
        mutated += dna[i];
      }
    }
    return mutated;
  }

  step(): GenerationStats {
    // Sort population by fitness (descending)
    this.population.sort((a, b) => b.fitness - a.fitness);

    // Calculate number of survivors
    const survivorCount = Math.max(
      2,
      Math.ceil(this.population.length * (this.config.survivalRate / 100)),
    );
    const survivors = this.population.slice(0, survivorCount);

    // Create new population
    const newPopulation: Individual[] = [...survivors];

    while (newPopulation.length < this.config.populationSize) {
      const parent1 = this.selectParent(survivors);
      const parent2 = this.selectParent(survivors);

      const [child1DNA, child2DNA] = this.crossover(parent1, parent2);

      const mutatedChild1 = this.mutate(child1DNA);
      const mutatedChild2 = this.mutate(child2DNA);

      if (newPopulation.length < this.config.populationSize) {
        newPopulation.push({
          dna: mutatedChild1,
          fitness: this.calculateFitness(mutatedChild1),
        });
      }

      if (newPopulation.length < this.config.populationSize) {
        newPopulation.push({
          dna: mutatedChild2,
          fitness: this.calculateFitness(mutatedChild2),
        });
      }
    }

    this.population = newPopulation;
    this.generation++;

    return this.getStats();
  }

  getStats(): GenerationStats {
    const sortedPopulation = [...this.population].sort((a, b) => b.fitness - a.fitness);
    const bestIndividual = sortedPopulation[0];
    const totalFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0);
    const averageFitness = totalFitness / this.population.length;
    const isComplete = bestIndividual.fitness === this.config.target.length;

    return {
      generation: this.generation,
      bestIndividual,
      averageFitness,
      isComplete,
    };
  }

  reset(): void {
    this.population = [];
    this.generation = 0;
  }

  updateConfig(config: Partial<GeneticAlgorithmConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.characterSet) {
      this.setCharacterPool();
    }
  }
}
