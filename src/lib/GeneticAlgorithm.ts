export type CharacterSet = 'letters-space' | 'alphanumeric-space' | 'printable-ascii';
export type SelectionStrategy = 'elitism' | 'semi-elitism' | 'random';

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
  selectionStrategy: SelectionStrategy;
}

export interface GenerationStats {
  generation: number;
  bestIndividual: Individual;
  averageFitness: number;
  diversity: number;
  isComplete: boolean;
  isStagnant: boolean;
  generationsSinceImprovement: number;
}

export class GeneticAlgorithm {
  private config: GeneticAlgorithmConfig;
  private population: Individual[] = [];
  private generation: number = 0;
  private characterPool: string = '';
  private bestFitnessHistory: number[] = [];
  private generationsSinceImprovement: number = 0;
  private readonly stagnationThreshold: number = 50;

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

  public getCharacterPool(): string {
    return this.characterPool;
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
    this.bestFitnessHistory = [];
    this.generationsSinceImprovement = 0;
    const targetLength = this.config.target.length;

    for (let i = 0; i < this.config.populationSize; i++) {
      const dna = this.generateRandomString(targetLength);
      this.population.push({
        dna,
        fitness: this.calculateFitness(dna),
      });
    }
  }

  private selectParent(pool: Individual[]): Individual {
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }

  private selectRandomFromPopulation(): Individual {
    const index = Math.floor(Math.random() * this.population.length);
    return this.population[index];
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

  private calculateDiversity(): number {
    if (this.population.length === 0) return 0;

    const uniqueStrings = new Set(this.population.map((ind) => ind.dna));
    return (uniqueStrings.size / this.population.length) * 100;
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

    // Create new population based on strategy
    let newPopulation: Individual[] = [];

    // For elitism, keep top survivors
    if (this.config.selectionStrategy === 'elitism') {
      newPopulation = [...survivors];
    }

    // Fill the rest of the population
    while (newPopulation.length < this.config.populationSize) {
      let parent1: Individual;
      let parent2: Individual;

      switch (this.config.selectionStrategy) {
        case 'elitism':
          // Both parents from survivors
          parent1 = this.selectParent(survivors);
          parent2 = this.selectParent(survivors);
          break;

        case 'semi-elitism':
          // One parent from survivors, one from entire population
          parent1 = this.selectParent(survivors);
          parent2 = this.selectRandomFromPopulation();
          break;

        case 'random':
          // Both parents from entire population
          parent1 = this.selectRandomFromPopulation();
          parent2 = this.selectRandomFromPopulation();
          break;
      }

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
    const diversity = this.calculateDiversity();
    const isComplete = bestIndividual.fitness === this.config.target.length;

    // Track best fitness history and check for improvements
    if (
      this.bestFitnessHistory.length === 0 ||
      bestIndividual.fitness > this.bestFitnessHistory[this.bestFitnessHistory.length - 1]
    ) {
      this.generationsSinceImprovement = 0;
    } else {
      this.generationsSinceImprovement++;
    }
    this.bestFitnessHistory.push(bestIndividual.fitness);

    const isStagnant = this.generationsSinceImprovement >= this.stagnationThreshold;

    return {
      generation: this.generation,
      bestIndividual,
      averageFitness,
      diversity,
      isComplete,
      isStagnant,
      generationsSinceImprovement: this.generationsSinceImprovement,
    };
  }

  reset(): void {
    this.population = [];
    this.generation = 0;
    this.bestFitnessHistory = [];
    this.generationsSinceImprovement = 0;
  }

  updateConfig(config: Partial<GeneticAlgorithmConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.characterSet) {
      this.setCharacterPool();
    }
  }
}
