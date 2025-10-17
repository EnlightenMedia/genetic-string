export interface ChartData {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  diversity: number;
  maxFitness: number;
}

export class ChartController {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: ChartData[] = [];
  private emptyMessage: HTMLElement;

  private readonly padding = { top: 20, right: 50, bottom: 40, left: 50 };
  private readonly bestColor = '#4caf50';
  private readonly avgColor = '#646cff';
  private readonly diversityColor = '#ff9800';
  private readonly gridColor = 'rgba(255, 255, 255, 0.1)';
  private readonly textColor = 'rgba(255, 255, 255, 0.6)';

  constructor(canvasId: string, emptyMessageId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.emptyMessage = document.getElementById(emptyMessageId) as HTMLElement;

    if (!this.canvas) {
      throw new Error(`Canvas element not found: ${canvasId}`);
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;

    this.setupCanvas();
    window.addEventListener('resize', () => this.setupCanvas());
  }

  private setupCanvas(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.scale(dpr, dpr);

    if (this.data.length > 0) {
      this.draw();
    }
  }

  public addDataPoint(
    generation: number,
    bestFitness: number,
    avgFitness: number,
    diversity: number,
    maxFitness: number,
  ): void {
    this.data.push({ generation, bestFitness, avgFitness, diversity, maxFitness });

    if (this.data.length === 1) {
      this.canvas.classList.add('active');
      this.emptyMessage.classList.add('hidden');
    }

    this.draw();
  }

  public clear(): void {
    this.data = [];
    this.canvas.classList.remove('active');
    this.emptyMessage.classList.remove('hidden');
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private draw(): void {
    if (this.data.length === 0) return;

    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Calculate chart dimensions
    const chartWidth = width - this.padding.left - this.padding.right;
    const chartHeight = height - this.padding.top - this.padding.bottom;

    // Find data ranges
    const maxGen = Math.max(...this.data.map((d) => d.generation));
    const maxFit = this.data[0].maxFitness;
    const minGen = 0;
    const minFit = 0;

    // Dynamic diversity range for better visibility
    const diversityValues = this.data.map((d) => d.diversity);
    const maxDiv = Math.ceil(Math.max(...diversityValues));
    const minDiv = Math.floor(Math.min(...diversityValues));

    // Draw grid and axes
    this.drawGrid(chartWidth, chartHeight, maxGen, maxFit, maxDiv, minDiv);

    // Draw fitness lines (left y-axis)
    this.drawLine(
      this.data.map((d) => d.bestFitness),
      this.bestColor,
      chartWidth,
      chartHeight,
      maxGen,
      maxFit,
      minGen,
      minFit,
    );
    this.drawLine(
      this.data.map((d) => d.avgFitness),
      this.avgColor,
      chartWidth,
      chartHeight,
      maxGen,
      maxFit,
      minGen,
      minFit,
    );

    // Draw diversity line (right y-axis)
    this.drawLine(
      this.data.map((d) => d.diversity),
      this.diversityColor,
      chartWidth,
      chartHeight,
      maxGen,
      maxDiv,
      minGen,
      minDiv,
    );
  }

  private drawGrid(
    chartWidth: number,
    chartHeight: number,
    maxGen: number,
    maxFit: number,
    maxDiv: number,
    minDiv: number,
  ): void {
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.font = '12px Inter, sans-serif';
    this.ctx.fillStyle = this.textColor;

    // Horizontal grid lines (fitness)
    const fitnessSteps = 5;
    for (let i = 0; i <= fitnessSteps; i++) {
      const y = this.padding.top + (chartHeight * i) / fitnessSteps;
      const fitness = maxFit - (maxFit * i) / fitnessSteps;

      this.ctx.beginPath();
      this.ctx.moveTo(this.padding.left, y);
      this.ctx.lineTo(this.padding.left + chartWidth, y);
      this.ctx.stroke();

      // Y-axis labels (left - fitness)
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(Math.round(fitness).toString(), this.padding.left - 10, y);

      // Y-axis labels (right - diversity %)
      const diversity = maxDiv - ((maxDiv - minDiv) * i) / fitnessSteps;
      this.ctx.textAlign = 'left';
      this.ctx.fillText(Math.round(diversity) + '%', this.padding.left + chartWidth + 10, y);
    }

    // Vertical grid lines (generation)
    const genSteps = Math.min(10, maxGen);
    for (let i = 0; i <= genSteps; i++) {
      const x = this.padding.left + (chartWidth * i) / genSteps;
      const gen = Math.round((maxGen * i) / genSteps);

      this.ctx.beginPath();
      this.ctx.moveTo(x, this.padding.top);
      this.ctx.lineTo(x, this.padding.top + chartHeight);
      this.ctx.stroke();

      // X-axis labels
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(gen.toString(), x, this.padding.top + chartHeight + 10);
    }

    // Axis labels
    this.ctx.fillStyle = this.textColor;
    this.ctx.font = 'bold 12px Inter, sans-serif';

    // Y-axis label
    this.ctx.save();
    this.ctx.translate(15, this.padding.top + chartHeight / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Fitness', 0, 0);
    this.ctx.restore();

    // X-axis label
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Generation',
      this.padding.left + chartWidth / 2,
      this.padding.top + chartHeight + 30,
    );
  }

  private drawLine(
    values: number[],
    color: string,
    chartWidth: number,
    chartHeight: number,
    maxGen: number,
    maxFit: number,
    minGen: number,
    minFit: number,
  ): void {
    if (values.length === 0) return;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    for (let i = 0; i < values.length; i++) {
      const x =
        this.padding.left +
        ((this.data[i].generation - minGen) / (maxGen - minGen || 1)) * chartWidth;
      const y =
        this.padding.top +
        chartHeight -
        ((values[i] - minFit) / (maxFit - minFit || 1)) * chartHeight;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();

    // Draw points
    this.ctx.fillStyle = color;
    for (let i = 0; i < values.length; i++) {
      const x =
        this.padding.left +
        ((this.data[i].generation - minGen) / (maxGen - minGen || 1)) * chartWidth;
      const y =
        this.padding.top +
        chartHeight -
        ((values[i] - minFit) / (maxFit - minFit || 1)) * chartHeight;

      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
