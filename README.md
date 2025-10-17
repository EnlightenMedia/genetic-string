# Genetic String Evolution Simulator

A interactive web application that demonstrates how genetic algorithms can evolve random strings into a target string through natural selection, crossover, and mutation.

![Genetic Algorithm Visualization](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

🎮 **[Try the live demo](https://genetic-string.enlighten-media.net/)**

## 🧬 What is This?

This project visualizes how genetic algorithms work by evolving random strings to match a target string. Watch as a population of random characters gradually evolves through generations using principles inspired by natural selection:

- **Selection**: The fittest individuals survive to reproduce
- **Crossover**: Parents combine their "DNA" to create offspring
- **Mutation**: Random changes introduce genetic diversity
- **Evolution**: Over generations, the population converges on the target

## ✨ Features

### Core Functionality

- **Real-time Evolution**: Watch strings evolve generation by generation
- **Interactive Controls**: Initialize, step through, start, stop, and reset simulations
- **Customizable Parameters**: Adjust population size, survival rate, mutation, and timing

### Visualization

- **Progress Chart**: Real-time graph showing best fitness and average fitness over generations
- **Population View**: See all individuals in the current population with their fitness scores
- **Statistics Dashboard**: Track generation count, best string, scores, diversity, and convergence

### Advanced Features

- **Quick Presets**: One-click examples including:
  - Hello World
  - Shakespeare quotes
  - Pangrams
  - DNA sequences
  - Code snippets
- **Character Set Selection**: Choose from letters, alphanumeric, or full ASCII
- **Population Diversity Metric**: Monitor genetic diversity percentage
- **Convergence Detection**: Automatic alerts when evolution stagnates (50+ generations without improvement)
- **Mutation Controls**:
  - Toggle mutation on/off
  - Adjustable mutation rate slider (0.1% - 10%)
  - Real-time rate display

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd genetic-string
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📖 How to Use

1. **Choose a Target String**: Enter the string you want the algorithm to evolve towards, or click a preset example

2. **Configure Parameters**:
   - **Population Size**: Number of individuals (more = better exploration but slower)
   - **Survival Percentage**: What % of the best individuals survive each generation
   - **Character Set**: Available characters for the algorithm to use
   - **Mutation**: Enable to introduce random changes (helps escape local optima)
   - **Mutation Rate**: Fine-tune the probability of character mutations (0.1% - 10%)
   - **Step Delay**: Time between generations when running automatically

3. **Initialize**: Click "Initialize" to create the initial random population

4. **Run the Simulation**:
   - **Step**: Advance one generation at a time
   - **Start**: Run continuously at the configured delay
   - **Stop**: Pause the simulation
   - **Reset**: Clear everything and start over

5. **Monitor Progress**:
   - Watch the progress chart show best and average fitness over generations
   - Track population diversity percentage to see genetic variation
   - Monitor "generations since improvement" counter
   - Watch for convergence alerts if evolution stagnates for 50+ generations

## 🧮 How It Works

### The Genetic Algorithm

1. **Initialization**: Create a population of random strings (same length as target)

2. **Fitness Evaluation**: Each string is scored based on matching characters with the target

3. **Selection**: Top performers (based on survival percentage) are kept

4. **Crossover**: Random pairs of survivors are selected to create offspring by:
   - Choosing a random split point
   - Combining portions from each parent

5. **Mutation** (if enabled): Random characters may change with a small probability

6. **Repeat**: Steps 2-5 continue until the target string is found or manually stopped

### Population Diversity

Calculated as the percentage of unique DNA strings in the population:

- **High diversity** (>50%): Population is exploring many different solutions
- **Low diversity** (<20%): Population has converged on similar solutions

### Convergence Detection

The system tracks generations without improvement. After 50 generations with no fitness increase, a prominent orange alert appears with the exact stagnation count. This suggests you might need to:

- Enable mutation or increase the mutation rate slider
- Adjust survival percentage for more genetic diversity
- Reset and try different parameters

## 🎯 Example Use Cases

### Educational

- Learn genetic algorithm concepts
- Visualize evolutionary processes
- Understand fitness functions and selection pressure

### Experimentation

- Test different parameter combinations
- Compare mutation vs. no mutation
- Observe diversity and convergence patterns
- Study the effect of population size on evolution speed

### Entertainment

- Challenge yourself with difficult targets
- Compare evolution speeds across different strings
- Watch the mesmerizing visualization of digital evolution

## 🏗️ Project Structure

```
genetic-string/
├── src/
│   ├── lib/
│   │   ├── GeneticAlgorithm.ts    # Core GA logic
│   │   ├── UIController.ts         # UI management
│   │   └── ChartController.ts      # Chart visualization
│   ├── main.ts                     # Application entry
│   └── style.css                   # Styling
├── index.html                      # HTML structure
├── package.json
└── README.md
```

## 🔧 Technologies Used

- **TypeScript**: Type-safe JavaScript for robust code
- **Vite**: Fast build tool and dev server
- **Canvas API**: For real-time chart rendering
- **CSS3**: Modern styling with animations
- **Genetic Algorithms**: Evolutionary computation principles

## 🎨 Key Concepts Demonstrated

- **Genetic Algorithms**: Population-based optimization
- **Fitness Functions**: Objective evaluation of solutions
- **Selection Pressure**: Survival of the fittest
- **Genetic Operators**: Crossover and mutation
- **Convergence**: Population reaching optimal solutions
- **Diversity**: Maintaining genetic variation

## 🤝 Contributing

Contributions are welcome! Some ideas for future improvements:

- Additional crossover strategies (two-point, uniform)
- Tournament selection
- Elitism controls (guarantee top N survive)
- Export/import simulation data as CSV/JSON
- More sophisticated fitness functions (partial credit for similar characters)
- Character-by-character visualization with color coding (green=match, red=mismatch)
- Adaptive mutation rates (decrease as fitness improves)
- Best-of-generation archive

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built as an educational tool to demonstrate genetic algorithms in an interactive and visual way.

---

**Enjoy watching evolution in action!** 🧬✨
