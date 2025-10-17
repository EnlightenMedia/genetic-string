import { GeneticAlgorithm } from './GeneticAlgorithm';
import type {
  GeneticAlgorithmConfig,
  GenerationStats,
  CharacterSet,
  SelectionStrategy,
} from './GeneticAlgorithm';
import { ChartController } from './ChartController';

export class UIController {
  private ga: GeneticAlgorithm | null = null;
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private chart: ChartController;

  // Input elements
  private targetInput: HTMLInputElement;
  private populationInput: HTMLInputElement;
  private survivalInput: HTMLInputElement;
  private delayInput: HTMLInputElement;
  private characterSetSelect: HTMLSelectElement;
  private selectionStrategySelect: HTMLSelectElement;
  private mutationToggle: HTMLInputElement;
  private mutationRateSlider: HTMLInputElement;
  private mutationRateValue: HTMLElement;

  // Button elements
  private initButton: HTMLButtonElement;
  private stepButton: HTMLButtonElement;
  private startButton: HTMLButtonElement;
  private stopButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;

  // Display elements
  private generationDisplay: HTMLElement;
  private bestStringDisplay: HTMLElement;
  private bestScoreDisplay: HTMLElement;
  private avgScoreDisplay: HTMLElement;
  private diversityDisplay: HTMLElement;
  private stagnationDisplay: HTMLElement;
  private statusDisplay: HTMLElement;
  private populationList: HTMLElement;
  private convergenceAlert: HTMLElement;
  private stagnantGensSpan: HTMLElement;

  constructor() {
    // Get input elements
    this.targetInput = this.getElement<HTMLInputElement>('#target');
    this.populationInput = this.getElement<HTMLInputElement>('#population');
    this.survivalInput = this.getElement<HTMLInputElement>('#survival');
    this.delayInput = this.getElement<HTMLInputElement>('#delay');
    this.characterSetSelect = this.getElement<HTMLSelectElement>('#characterSet');
    this.selectionStrategySelect = this.getElement<HTMLSelectElement>('#selectionStrategy');
    this.mutationToggle = this.getElement<HTMLInputElement>('#mutation');
    this.mutationRateSlider = this.getElement<HTMLInputElement>('#mutationRate');
    this.mutationRateValue = this.getElement('#mutationRateValue');

    // Get button elements
    this.initButton = this.getElement<HTMLButtonElement>('#initBtn');
    this.stepButton = this.getElement<HTMLButtonElement>('#stepBtn');
    this.startButton = this.getElement<HTMLButtonElement>('#startBtn');
    this.stopButton = this.getElement<HTMLButtonElement>('#stopBtn');
    this.resetButton = this.getElement<HTMLButtonElement>('#resetBtn');

    // Get display elements
    this.generationDisplay = this.getElement('#generation');
    this.bestStringDisplay = this.getElement('#bestString');
    this.bestScoreDisplay = this.getElement('#bestScore');
    this.avgScoreDisplay = this.getElement('#avgScore');
    this.diversityDisplay = this.getElement('#diversity');
    this.stagnationDisplay = this.getElement('#stagnation');
    this.statusDisplay = this.getElement('#status');
    this.populationList = this.getElement('#populationList');
    this.convergenceAlert = this.getElement('#convergenceAlert');
    this.stagnantGensSpan = this.getElement('#stagnantGens');

    // Initialize chart
    this.chart = new ChartController('fitnessChart', 'chartEmptyMessage');

    this.attachEventListeners();
    this.updateButtonStates();
  }

  private getElement<T extends HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    return element;
  }

  private attachEventListeners(): void {
    this.initButton.addEventListener('click', () => this.handleInitialize());
    this.stepButton.addEventListener('click', () => this.handleStep());
    this.startButton.addEventListener('click', () => this.handleStart());
    this.stopButton.addEventListener('click', () => this.handleStop());
    this.resetButton.addEventListener('click', () => this.handleReset());

    // Preset buttons
    const presetButtons = document.querySelectorAll('.btn-preset');
    presetButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const preset = (e.target as HTMLElement).getAttribute('data-preset');
        if (preset) {
          this.applyPreset(preset);
        }
      });
    });

    // Input validation
    this.populationInput.addEventListener('input', () => {
      const value = parseInt(this.populationInput.value);
      if (value < 0) this.populationInput.value = '0';
      if (value > 10000) this.populationInput.value = '10000';
    });

    this.survivalInput.addEventListener('input', () => {
      const value = parseInt(this.survivalInput.value);
      if (value < 1) this.survivalInput.value = '1';
      if (value > 100) this.survivalInput.value = '100';
    });

    this.delayInput.addEventListener('input', () => {
      const value = parseInt(this.delayInput.value);
      if (value < 0) this.delayInput.value = '0';
    });

    // Update mutation rate display
    this.mutationRateSlider.addEventListener('input', () => {
      this.mutationRateValue.textContent = this.mutationRateSlider.value;
    });
  }

  private getConfig(): GeneticAlgorithmConfig {
    return {
      target: this.targetInput.value,
      populationSize: parseInt(this.populationInput.value),
      survivalRate: parseInt(this.survivalInput.value),
      mutationEnabled: this.mutationToggle.checked,
      mutationRate: parseFloat(this.mutationRateSlider.value) / 100,
      characterSet: this.characterSetSelect.value as CharacterSet,
      selectionStrategy: this.selectionStrategySelect.value as SelectionStrategy,
    };
  }

  private handleInitialize(): void {
    const config = this.getConfig();

    if (!config.target) {
      this.updateStatus('Please enter a target string', 'error');
      return;
    }

    if (config.populationSize < 2) {
      this.updateStatus('Population size must be at least 2', 'error');
      return;
    }

    // Create a temporary instance to get the character pool
    const tempGA = new GeneticAlgorithm(config);
    const characterPool = tempGA.getCharacterPool();

    // Check if all characters in target are in the character set
    const invalidChars: string[] = [];
    for (const char of config.target) {
      if (!characterPool.includes(char) && !invalidChars.includes(char)) {
        invalidChars.push(char);
      }
    }

    if (invalidChars.length > 0) {
      const charList = invalidChars.map((c) => `'${c}'`).join(', ');
      this.updateStatus(
        `Target string contains characters not in selected character set: ${charList}`,
        'error',
      );
      return;
    }

    // Clear previous data before initializing new simulation
    this.chart.clear();

    this.ga = tempGA;
    this.ga.initialize();

    const stats = this.ga.getStats();
    this.updateDisplay(stats);
    this.updateStatus('Simulation initialized', 'success');
    this.updateButtonStates();
  }

  private handleStep(): void {
    if (!this.ga) {
      this.updateStatus('Please initialize the simulation first', 'error');
      return;
    }

    const stats = this.ga.step();
    this.updateDisplay(stats);

    if (stats.isComplete) {
      this.updateStatus('Target reached! 🎉', 'success');
      this.handleStop();
    } else {
      this.updateStatus('Step completed', 'success');
    }
  }

  private handleStart(): void {
    if (!this.ga) {
      this.updateStatus('Please initialize the simulation first', 'error');
      return;
    }

    this.isRunning = true;
    this.updateButtonStates();
    this.updateStatus('Simulation running...', 'running');

    const delay = parseInt(this.delayInput.value);

    const runStep = () => {
      if (!this.isRunning || !this.ga) return;

      const stats = this.ga.step();
      this.updateDisplay(stats);

      if (stats.isComplete) {
        this.updateStatus('Target reached! 🎉', 'success');
        this.handleStop();
      } else {
        this.intervalId = window.setTimeout(runStep, delay);
      }
    };

    this.intervalId = window.setTimeout(runStep, delay);
  }

  private handleStop(): void {
    this.isRunning = false;
    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.updateButtonStates();
    this.updateStatus('Simulation stopped', 'info');
  }

  private handleReset(): void {
    this.handleStop();

    if (this.ga) {
      this.ga.reset();
    }

    this.ga = null;
    this.clearDisplay();
    this.updateStatus('Simulation reset', 'info');
    this.updateButtonStates();
  }

  private updateDisplay(stats: GenerationStats): void {
    this.generationDisplay.textContent = stats.generation.toString();
    this.bestStringDisplay.textContent = `"${stats.bestIndividual.dna}"`;
    this.bestScoreDisplay.textContent = `${stats.bestIndividual.fitness} / ${stats.bestIndividual.dna.length}`;
    this.avgScoreDisplay.textContent = stats.averageFitness.toFixed(2);
    this.diversityDisplay.textContent = `${stats.diversity.toFixed(1)}%`;
    this.stagnationDisplay.textContent = stats.generationsSinceImprovement.toString();
    this.updatePopulationDisplay();

    // Update convergence alert
    if (stats.isStagnant && !stats.isComplete) {
      this.convergenceAlert.classList.remove('hidden');
      this.stagnantGensSpan.textContent = stats.generationsSinceImprovement.toString();
    } else {
      this.convergenceAlert.classList.add('hidden');
    }

    // Update chart
    const maxFitness = stats.bestIndividual.dna.length;
    this.chart.addDataPoint(
      stats.generation,
      stats.bestIndividual.fitness,
      stats.averageFitness,
      maxFitness,
    );
  }

  private clearDisplay(): void {
    this.generationDisplay.textContent = '-';
    this.bestStringDisplay.textContent = '-';
    this.bestScoreDisplay.textContent = '-';
    this.avgScoreDisplay.textContent = '-';
    this.diversityDisplay.textContent = '-';
    this.stagnationDisplay.textContent = '-';
    this.populationList.innerHTML =
      '<p class="empty-message">Initialize the simulation to see the population</p>';
    this.convergenceAlert.classList.add('hidden');
    this.chart.clear();
  }

  private updateStatus(message: string, type: 'success' | 'error' | 'info' | 'running'): void {
    this.statusDisplay.textContent = message;
    this.statusDisplay.className = `status ${type}`;
  }

  private updateButtonStates(): void {
    const isInitialized = this.ga !== null;

    this.initButton.disabled = this.isRunning;
    this.stepButton.disabled = !isInitialized || this.isRunning;
    this.startButton.disabled = !isInitialized || this.isRunning;
    this.stopButton.disabled = !this.isRunning;
    this.resetButton.disabled = this.isRunning;

    // Disable inputs while running
    this.targetInput.disabled = this.isRunning;
    this.populationInput.disabled = this.isRunning;
    this.survivalInput.disabled = this.isRunning;
    this.characterSetSelect.disabled = this.isRunning;
    this.selectionStrategySelect.disabled = this.isRunning;
    this.mutationToggle.disabled = this.isRunning;
    this.mutationRateSlider.disabled = this.isRunning;

    // Disable preset buttons while running
    const presetButtons = document.querySelectorAll('.btn-preset');
    presetButtons.forEach((button) => {
      (button as HTMLButtonElement).disabled = this.isRunning;
    });
  }

  private updatePopulationDisplay(): void {
    if (!this.ga) {
      this.populationList.innerHTML =
        '<p class="empty-message">Initialize the simulation to see the population</p>';
      return;
    }

    const population = (this.ga as any).population as Array<{ dna: string; fitness: number }>;

    // Sort population by fitness (descending) for display
    const sortedPopulation = [...population].sort((a, b) => b.fitness - a.fitness);

    this.populationList.innerHTML = sortedPopulation
      .map((individual, index) => {
        const isBest = index === 0;
        const percentage = ((individual.fitness / individual.dna.length) * 100).toFixed(1);
        return `
          <div class="population-item ${isBest ? 'best' : ''}">
            <div class="population-dna">${this.escapeHtml(individual.dna)}</div>
            <div class="population-fitness">
              Score: <span class="fitness-value">${individual.fitness}/${
          individual.dna.length
        }</span> (${percentage}%)
            </div>
          </div>
        `;
      })
      .join('');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private applyPreset(preset: string): void {
    interface PresetConfig {
      target: string;
      population: number;
      survival: number;
      characterSet: CharacterSet;
      selectionStrategy: SelectionStrategy;
      mutation: boolean;
      mutationRate: number;
      delay: number;
    }

    const presets: Record<string, PresetConfig> = {
      hello: {
        target: 'Hello World',
        population: 500,
        survival: 20,
        characterSet: 'letters-space',
        selectionStrategy: 'elitism',
        mutation: false,
        mutationRate: 1.0,
        delay: 100,
      },
      shakespeare: {
        target: 'To be or not to be',
        population: 800,
        survival: 15,
        characterSet: 'letters-space',
        selectionStrategy: 'elitism',
        mutation: true,
        mutationRate: 2.0,
        delay: 50,
      },
      pangram: {
        target: 'The quick brown fox jumps',
        population: 1000,
        survival: 10,
        characterSet: 'letters-space',
        selectionStrategy: 'semi-elitism',
        mutation: true,
        mutationRate: 1.5,
        delay: 50,
      },
      evolution: {
        target: 'Evolution in action',
        population: 800,
        survival: 20,
        characterSet: 'letters-space',
        selectionStrategy: 'elitism',
        mutation: false,
        mutationRate: 1.0,
        delay: 75,
      },
      dna: {
        target: 'ACGTACGTACGT',
        population: 300,
        survival: 25,
        characterSet: 'letters-space',
        selectionStrategy: 'random',
        mutation: false,
        mutationRate: 0.5,
        delay: 100,
      },
      code: {
        target: 'function hello()',
        population: 600,
        survival: 15,
        characterSet: 'printable-ascii',
        selectionStrategy: 'elitism',
        mutation: true,
        mutationRate: 3.0,
        delay: 75,
      },
    };

    const config = presets[preset];
    if (config) {
      this.targetInput.value = config.target;
      this.populationInput.value = config.population.toString();
      this.survivalInput.value = config.survival.toString();
      this.characterSetSelect.value = config.characterSet;
      this.selectionStrategySelect.value = config.selectionStrategy;
      this.mutationToggle.checked = config.mutation;
      this.mutationRateSlider.value = config.mutationRate.toString();
      this.mutationRateValue.textContent = config.mutationRate.toString();
      this.delayInput.value = config.delay.toString();

      this.updateStatus(`Preset loaded: "${config.target}"`, 'info');
    }
  }
}
