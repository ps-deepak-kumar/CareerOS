export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

export interface QuizResult {
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  total: number;
  accuracy: number;
  badge: 'master' | 'proficient' | 'learner' | 'retry';
  completedAt: string;
}

// ─── Master Quiz Bank ─────────────────────────────────────────────────────────
const QUIZ_BANK: Record<string, { easy: QuizQuestion[]; medium: QuizQuestion[]; hard: QuizQuestion[] }> = {
  'cloud computing': {
    easy: [
      { id: 'cc-e-1', topic: 'Cloud Computing', difficulty: 'Easy', question: 'What does "IaaS" stand for in cloud computing?', options: ['Internet as a Service', 'Infrastructure as a Service', 'Integration as a Service', 'Intelligence as a Service'], correctIndex: 1, explanation: 'IaaS (Infrastructure as a Service) provides virtualized computing resources over the internet — servers, storage, and networking on demand.', hint: 'Think of renting the physical hardware layer from a provider.' },
      { id: 'cc-e-2', topic: 'Cloud Computing', difficulty: 'Easy', question: 'Which of the following is a public cloud provider?', options: ["Your company's own data center", 'Amazon Web Services (AWS)', 'A private server room', 'An on-premise database'], correctIndex: 1, explanation: 'AWS, Google Cloud, and Azure are the three major public cloud providers offering shared resources over the internet.', hint: 'Public cloud = available to anyone via the internet.' },
      { id: 'cc-e-3', topic: 'Cloud Computing', difficulty: 'Easy', question: "What is the primary advantage of cloud computing's pay-as-you-go pricing?", options: ['You pay a fixed monthly fee', 'You only pay for resources you actually consume', 'You must sign long-term contracts', 'All services are completely free'], correctIndex: 1, explanation: 'Pay-as-you-go eliminates upfront capital expenditure — you only pay for what you use, allowing cost optimization.', hint: 'Think about how you pay for electricity at home.' },
      { id: 'cc-e-4', topic: 'Cloud Computing', difficulty: 'Easy', question: 'What does "SaaS" mean?', options: ['System as a Software', 'Software as a Service', 'Server as a Service', 'Storage as a Service'], correctIndex: 1, explanation: 'SaaS delivers software applications over the internet on a subscription basis — Gmail, Slack, and Salesforce are examples.', hint: 'Gmail and Dropbox are classic SaaS examples.' },
      { id: 'cc-e-5', topic: 'Cloud Computing', difficulty: 'Easy', question: 'What is cloud "elasticity"?', options: ['The ability to bend physical servers', 'Automatic scaling of resources based on demand', 'Fixed resource allocation', 'Manual server configuration'], correctIndex: 1, explanation: 'Elasticity allows cloud systems to automatically provision more resources during peak demand and scale back during low usage.', hint: 'Like a rubber band that stretches when needed.' },
    ],
    medium: [
      { id: 'cc-m-1', topic: 'Cloud Computing', difficulty: 'Medium', question: 'What is the difference between vertical scaling (scale up) and horizontal scaling (scale out)?', options: ['Vertical adds more machines; horizontal adds more power to one machine', 'Vertical adds more CPU/RAM to one machine; horizontal adds more machines', 'Both are identical strategies', 'Vertical is for databases only'], correctIndex: 1, explanation: 'Vertical scaling increases one machine capacity. Horizontal scaling adds more machines to distribute the load.', hint: 'Vertical = make one machine bigger. Horizontal = add more machines.' },
      { id: 'cc-m-2', topic: 'Cloud Computing', difficulty: 'Medium', question: 'What is a CDN and why is it used?', options: ['A central database for all users', 'A distributed server network delivering content from locations nearest to the user', 'A programming language for cloud apps', 'A load balancer configuration'], correctIndex: 1, explanation: 'A CDN caches content at edge locations worldwide, reducing latency by serving content from the nearest geographic node.', hint: 'Why does Netflix load fast in India when servers are in the US?' },
      { id: 'cc-m-3', topic: 'Cloud Computing', difficulty: 'Medium', question: 'What is an Availability Zone in AWS?', options: ['A geographic country where AWS operates', 'An isolated data center within a region with independent power and networking', 'A billing management zone', 'A virtual network partition'], correctIndex: 1, explanation: 'Availability Zones are physically separate data centers within an AWS Region with independent power, cooling, and networking for fault isolation.', hint: 'AZs are the physical buildings — Regions are the cities.' },
      { id: 'cc-m-4', topic: 'Cloud Computing', difficulty: 'Medium', question: 'What is a "serverless" architecture?', options: ['There are literally no servers involved', 'Developers write code without managing server infrastructure — the provider auto-provisions on demand', 'Servers that run without electricity', 'A purely local computing approach'], correctIndex: 1, explanation: 'Serverless (e.g., AWS Lambda) abstracts server management — you write functions that run in response to events, paying only for actual execution time, with no idle cost.', hint: 'There ARE servers — you just don\'t manage them.' },
      { id: 'cc-m-5', topic: 'Cloud Computing', difficulty: 'Medium', question: 'What is the CAP theorem in distributed systems?', options: ['Compute, Availability, and Performance theorem', 'A distributed system can only guarantee 2 of 3: Consistency, Availability, and Partition Tolerance', 'Cloud, API, and Protocol theorem', 'A security framework for cloud systems'], correctIndex: 1, explanation: 'CAP theorem states that in a distributed system experiencing network partitions, you must choose between Consistency (all nodes see same data) and Availability (all requests get a response).', hint: 'C = Consistency, A = Availability, P = Partition tolerance.' },
    ],
    hard: [
      { id: 'cc-h-1', topic: 'Cloud Computing', difficulty: 'Hard', question: 'What is the main trade-off when choosing Strong vs. Eventual Consistency in a distributed database?', options: ['Strong consistency is always cheaper', 'Strong consistency guarantees all reads see the latest write but increases latency; eventual consistency trades accuracy for lower latency and higher availability', 'There is no trade-off', 'Eventual consistency is stronger'], correctIndex: 1, explanation: 'The CAP theorem forces a choice during partitions. Strong consistency sacrifices availability; eventual consistency accepts stale reads to maintain availability.', hint: 'Which do you prefer: always correct data or always available system?' },
      { id: 'cc-h-2', topic: 'Cloud Computing', difficulty: 'Hard', question: 'What is VPC peering and what is its key limitation?', options: ['VPC peering connects VPCs with no limitations', 'VPC peering enables private traffic between VPCs but is non-transitive — A peers B and B peers C does NOT allow A to reach C through B', 'VPC peering only works in the same region', 'VPC peering works like a public VPN'], correctIndex: 1, explanation: 'VPC peering creates a private connection between VPCs, but it is non-transitive — traffic cannot hop through intermediate VPCs, requiring explicit peering for each connection pair.', hint: 'Think about what "transitive routing" means in networking.' },
    ]
  },

  'python': {
    easy: [
      { id: 'py-e-1', topic: 'Python', difficulty: 'Easy', question: 'What does "mutable" mean in Python?', options: ['An object that can be modified after creation', 'An object that cannot be changed', 'A function that returns nothing', 'A variable with a fixed type'], correctIndex: 0, explanation: 'Mutable objects (like lists, dicts) can be modified in-place. Immutable objects (like strings, tuples) cannot be changed once created.', hint: 'Lists are mutable; strings are immutable.' },
      { id: 'py-e-2', topic: 'Python', difficulty: 'Easy', question: 'Which Python keyword defines a function?', options: ['function', 'def', 'fn', 'method'], correctIndex: 1, explanation: "In Python, 'def' is used to define a function: def my_function(): ...", hint: "It's a 3-letter keyword, short for 'definition'." },
      { id: 'py-e-3', topic: 'Python', difficulty: 'Easy', question: 'What is a Python list comprehension?', options: ['A way to understand list documentation', 'A concise syntax for creating lists using a single expression', 'A compressed list type', 'A special Python module'], correctIndex: 1, explanation: 'List comprehension: [x*2 for x in range(10) if x%2==0] generates even doubles in one line.', hint: '[expression for item in iterable if condition]' },
      { id: 'py-e-4', topic: 'Python', difficulty: 'Easy', question: "What is len([1, 2, 3, 4, 5])?", options: ['4', '5', '6', 'Error'], correctIndex: 1, explanation: 'len() returns the number of items. The list has 5 elements.', hint: 'Count the items: 1, 2, 3, 4, 5.' },
      { id: 'py-e-5', topic: 'Python', difficulty: 'Easy', question: 'What does the "pass" statement do in Python?', options: ['Ends a function', 'Does nothing — acts as a placeholder for empty code blocks', 'Prints a value', 'Skips a loop iteration'], correctIndex: 1, explanation: "'pass' is a null operation used when a statement is required syntactically but no action is needed — useful for empty functions, classes, or loops.", hint: 'How do you write an empty function without a syntax error?' },
    ],
    medium: [
      { id: 'py-m-1', topic: 'Python', difficulty: 'Medium', question: 'What is the difference between @staticmethod and @classmethod?', options: ['They are identical', '@staticmethod receives no implicit first argument; @classmethod receives the class (cls) as its first argument', '@classmethod is only for abstract classes', '@staticmethod can modify class state'], correctIndex: 1, explanation: '@staticmethod is a regular function inside a class with no access to class state. @classmethod receives cls and can access/modify class-level state.', hint: 'cls vs self — what is the first parameter of each?' },
      { id: 'py-m-2', topic: 'Python', difficulty: 'Medium', question: 'What does the Python GIL prevent?', options: ['Memory leaks', 'True parallel execution of multiple Python threads on multiple CPU cores simultaneously', 'Importing modules', 'Garbage collection'], correctIndex: 1, explanation: 'The GIL is a mutex that prevents multiple threads from executing Python bytecode simultaneously — even on multi-core machines. Use multiprocessing for CPU-bound parallelism.', hint: 'Why does Python multithreading not use multiple CPU cores?' },
      { id: 'py-m-3', topic: 'Python', difficulty: 'Medium', question: "What are Python generators and what is the 'yield' keyword?", options: ['A type of list', "A function that returns an iterator — 'yield' pauses and resumes the function, producing values lazily", 'A built-in module', 'An error handling mechanism'], correctIndex: 1, explanation: "Generators produce values lazily using 'yield', allowing iteration over large sequences without storing them in memory.", hint: 'Think of yield as a return that remembers where it left off.' },
    ],
    hard: [
      { id: 'py-h-1', topic: 'Python', difficulty: 'Hard', question: "What is Python's descriptor protocol and when would you implement __get__, __set__, __delete__?", options: ['A file I/O protocol', 'A mechanism where objects define how attribute access is handled — enabling computed properties, validation, and lazy loading', 'A garbage collection protocol', 'A JSON serialization method'], correctIndex: 1, explanation: 'Descriptors control attribute access: __get__ handles reads, __set__ handles assignments. Used by @property, @classmethod, and ORMs like SQLAlchemy.', hint: 'How does @property actually work under the hood?' },
      { id: 'py-h-2', topic: 'Python', difficulty: 'Hard', question: "What is Python's metaclass and when would you use one?", options: ['A parent class for all objects', "A class of a class — it controls how classes are created, enabling custom class behavior like ORMs, APIs, or enforcing interface contracts at class definition time", 'A type of decorator', 'A module for type checking'], correctIndex: 1, explanation: "Metaclasses define how Python classes are constructed. type is Python's default metaclass. ORMs like Django's models use metaclasses to auto-generate database fields from class attributes.", hint: 'If a class is an instance of its metaclass, what is type(MyClass)?' },
    ]
  },

  'machine learning': {
    easy: [
      { id: 'ml-e-1', topic: 'Machine Learning', difficulty: 'Easy', question: 'What is "overfitting" in machine learning?', options: ['When a model performs well on both training and test data', 'When a model memorizes training data including noise and performs poorly on unseen data', 'When training takes too long', 'When the model has too few parameters'], correctIndex: 1, explanation: 'Overfitting occurs when a model memorizes training data instead of learning generalizable rules, resulting in poor performance on new data.', hint: 'Think of a student who memorizes answers instead of understanding concepts.' },
      { id: 'ml-e-2', topic: 'Machine Learning', difficulty: 'Easy', question: 'What is a training dataset used for?', options: ['Evaluating final model performance', 'Teaching the model by adjusting weights based on examples', 'Deploying the model to production', 'Cleaning data'], correctIndex: 1, explanation: 'The training dataset teaches the model by showing input-output pairs and adjusting internal weights through optimization.', hint: "It's the data the model learns from." },
      { id: 'ml-e-3', topic: 'Machine Learning', difficulty: 'Easy', question: 'Which learning type uses labeled input-output pairs?', options: ['Unsupervised Learning', 'Reinforcement Learning', 'Supervised Learning', 'Semi-supervised Learning'], correctIndex: 2, explanation: 'Supervised learning trains on labeled examples where both input features and correct output labels are provided.', hint: 'The "supervisor" tells the model the correct answer during training.' },
      { id: 'ml-e-4', topic: 'Machine Learning', difficulty: 'Easy', question: 'What is the role of a loss function?', options: ['To generate training data', 'To measure how far model predictions are from actual values', 'To select features automatically', 'To visualize model outputs'], correctIndex: 1, explanation: 'A loss function quantifies the difference between predicted and actual values. The optimizer minimizes this loss during training.', hint: 'If the loss is 0, the model predicts perfectly.' },
      { id: 'ml-e-5', topic: 'Machine Learning', difficulty: 'Easy', question: 'What does a neural network "activation function" do?', options: ['Initializes model weights', 'Introduces non-linearity, enabling the network to learn complex patterns', 'Computes the loss', 'Normalizes input data'], correctIndex: 1, explanation: 'Without activation functions, neural networks would be linear transformations regardless of depth. Activations like ReLU and sigmoid introduce non-linearity for learning complex patterns.', hint: 'Why can stacking linear layers not solve non-linear problems?' },
    ],
    medium: [
      { id: 'ml-m-1', topic: 'Machine Learning', difficulty: 'Medium', question: 'What is the purpose of the validation set?', options: ['To train the model', 'To tune hyperparameters and assess performance during training without touching the test set', 'To clean noisy data', 'To deploy the model'], correctIndex: 1, explanation: 'The validation set tunes hyperparameters and detects overfitting during development, keeping the test set for final unbiased evaluation.', hint: 'Training/Validation/Test — what role does each play?' },
      { id: 'ml-m-2', topic: 'Machine Learning', difficulty: 'Medium', question: 'What does L2 regularization add to the loss function?', options: ['The absolute value of weights', 'The squared sum of weights (λ·||w||²)', 'A noise term', 'The log of the learning rate'], correctIndex: 1, explanation: 'L2 regularization adds λ times the sum of squared weights to penalize large weights and prevent overfitting.', hint: 'L1 = Lasso (absolute values), L2 = Ridge (squared values).' },
      { id: 'ml-m-3', topic: 'Machine Learning', difficulty: 'Medium', question: 'What is gradient descent?', options: ['A data preprocessing technique', 'An optimization algorithm that iteratively adjusts model parameters in the direction that minimizes the loss function', 'A feature selection method', 'A regularization technique'], correctIndex: 1, explanation: 'Gradient descent computes the gradient of the loss function with respect to parameters and takes a small step in the negative gradient direction (downhill) to reduce the loss.', hint: 'Imagine walking downhill in a foggy valley by feeling the slope under your feet.' },
    ],
    hard: [
      { id: 'ml-h-1', topic: 'Machine Learning', difficulty: 'Hard', question: 'Explain the bias-variance tradeoff and its relationship to model complexity.', options: ['High bias = high variance; low bias = low variance', 'High bias = underfitting (too simple); high variance = overfitting (too complex). Optimal models balance both through regularization and validation', 'Bias and variance are independent', 'High variance leads to better generalization'], correctIndex: 1, explanation: 'Bias is error from incorrect assumptions (underfitting). Variance is sensitivity to training data fluctuations (overfitting). Increasing complexity decreases bias but increases variance.', hint: 'Draw the U-shaped test error curve vs. model complexity.' },
    ]
  },

  'data structures': {
    easy: [
      { id: 'ds-e-1', topic: 'Data Structures', difficulty: 'Easy', question: 'What is the time complexity of accessing an array element by index?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correctIndex: 2, explanation: 'Arrays use direct memory addressing — base + index × size — so access is O(1) constant time regardless of size.', hint: 'Arrays store elements in contiguous memory with direct addressing.' },
      { id: 'ds-e-2', topic: 'Data Structures', difficulty: 'Easy', question: 'Which data structure follows LIFO (Last In First Out)?', options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'], correctIndex: 1, explanation: 'A Stack follows LIFO — the last element pushed is the first to be popped.', hint: 'Think of a stack of plates — you add and remove from the top.' },
      { id: 'ds-e-3', topic: 'Data Structures', difficulty: 'Easy', question: 'What is the main advantage of a Linked List over an Array?', options: ['Faster random access', 'Dynamic size and O(1) insertion/deletion at known positions', 'Less memory usage', 'Better cache performance'], correctIndex: 1, explanation: 'Linked Lists can grow/shrink dynamically and support O(1) insertions/deletions at a known position — unlike arrays which require shifting elements.', hint: 'What happens when you insert an element in the middle of an array?' },
      { id: 'ds-e-4', topic: 'Data Structures', difficulty: 'Easy', question: 'Which data structure follows FIFO (First In First Out)?', options: ['Stack', 'Queue', 'Hash Table', 'Heap'], correctIndex: 1, explanation: 'A Queue follows FIFO — elements are added at the rear (enqueue) and removed from the front (dequeue), like a line at a checkout counter.', hint: 'Think of a queue of people waiting in line.' },
      { id: 'ds-e-5', topic: 'Data Structures', difficulty: 'Easy', question: 'What is a hash table used for?', options: ['Storing sorted data', 'Enabling O(1) average-case key-value lookups using a hash function', 'Traversing data level-by-level', 'Finding the minimum element'], correctIndex: 1, explanation: 'Hash tables use a hash function to map keys to array indices, enabling average O(1) lookups, insertions, and deletions — forming the basis of Python dicts and Java HashMaps.', hint: 'A dictionary is implemented as a hash table under the hood.' },
    ],
    medium: [
      { id: 'ds-m-1', topic: 'Data Structures', difficulty: 'Medium', question: 'What is the worst-case time complexity of QuickSort and when does it occur?', options: ['O(n log n) always', 'O(n²) when the pivot always selects the smallest or largest element', 'O(log n) with random pivots', 'O(n) with median pivot'], correctIndex: 1, explanation: 'QuickSort worst case O(n²) occurs when the pivot is always the minimum/maximum element (e.g., already-sorted input with first-element pivot).', hint: 'What happens to the partition when the pivot is always the smallest element?' },
      { id: 'ds-m-2', topic: 'Data Structures', difficulty: 'Medium', question: 'How does a Hash Table handle collisions using chaining?', options: ['It overwrites the existing value', 'It stores multiple key-value pairs at the same bucket using a linked list', 'It resizes the table immediately', 'It uses binary search within the bucket'], correctIndex: 1, explanation: 'Chaining handles collisions by maintaining a linked list at each bucket. Multiple entries with the same hash are stored in that bucket\'s chain.', hint: 'Each bucket can hold multiple entries when they share the same hash.' },
    ],
    hard: [
      { id: 'ds-h-1', topic: 'Data Structures', difficulty: 'Hard', question: 'What properties of a Red-Black Tree guarantee O(log n) worst-case operations?', options: ['All paths have equal length', 'Root is black; red nodes have no red children; every root-to-null path has the same number of black nodes — bounding height to 2log(n+1)', 'It uses AVL rotations only', 'It rebalances after every operation'], correctIndex: 1, explanation: 'Red-Black Tree color properties bound the height to 2log₂(n+1), guaranteeing O(log n) for insert/delete/search.', hint: 'Focus on the black-height property and what it guarantees about tree height.' },
    ]
  },

  'transformer': {
    easy: [
      { id: 'tr-e-1', topic: 'Transformers', difficulty: 'Easy', question: 'What problem do Transformers solve that RNNs struggle with?', options: ['Faster GPU utilization', 'Long-range dependencies — RNNs suffer from vanishing gradients over long sequences', 'Image classification', 'Memory-efficient inference'], correctIndex: 1, explanation: 'RNNs process tokens sequentially and suffer from vanishing gradients. Transformers use attention to directly connect any two positions regardless of distance.', hint: 'What happens to information from the first word of a 1000-word sentence in an RNN?' },
      { id: 'tr-e-2', topic: 'Transformers', difficulty: 'Easy', question: 'What is self-attention in the Transformer architecture?', options: ['A neuron that monitors its own output', 'A mechanism where each token computes weighted relationships to all other tokens in the sequence', 'A type of recurrent connection', 'A convolutional filter applied to text'], correctIndex: 1, explanation: 'Self-attention allows each position in a sequence to attend to all other positions, capturing dependencies regardless of distance — the core innovation of Transformers.', hint: 'Each word "looks at" every other word to understand context.' },
    ],
    medium: [
      { id: 'tr-m-1', topic: 'Transformers', difficulty: 'Medium', question: 'What is the purpose of scaling by 1/√d_k in Scaled Dot-Product Attention?', options: ['Reduce memory footprint', 'Prevent dot products from growing too large, which would push softmax into near-zero gradient regions', 'Normalize output to [-1,1]', 'Speed up matrix multiplication'], correctIndex: 1, explanation: 'As d_k grows, dot products grow large, pushing softmax into saturation regions with near-zero gradients. Scaling by 1/√d_k keeps attention scores in a useful range.', hint: 'What does softmax output look like when inputs are very large numbers?' },
    ],
    hard: [
      { id: 'tr-h-1', topic: 'Transformers', difficulty: 'Hard', question: 'Why do modern LLMs use Rotary Position Embeddings (RoPE) instead of absolute sinusoidal encodings?', options: ['RoPE is simpler to implement', 'RoPE encodes position as rotations applied to Q/K vectors, enabling relative position to emerge naturally in attention scores and generalizing better to longer contexts', 'RoPE uses less memory', 'Sinusoidal encodings do not work at all'], correctIndex: 1, explanation: 'RoPE multiplies Q and K by complex rotations based on position. The rotation difference in Q·K^T captures relative distance, enabling better extrapolation beyond training context lengths.', hint: 'How does position information affect the Q·K dot product in RoPE vs. absolute encodings?' },
    ]
  },

  'sql': {
    easy: [
      { id: 'sql-e-1', topic: 'SQL', difficulty: 'Easy', question: 'Which SQL keyword retrieves data?', options: ['INSERT', 'SELECT', 'UPDATE', 'DELETE'], correctIndex: 1, explanation: 'SELECT is the fundamental SQL query keyword. Example: SELECT name FROM users WHERE age > 18.', hint: "It's the most used SQL statement — you SELECT data to view it." },
      { id: 'sql-e-2', topic: 'SQL', difficulty: 'Easy', question: 'What does a JOIN do in SQL?', options: ['Deletes rows from two tables', 'Combines rows from two or more tables based on a related column', 'Sorts results', 'Creates a new table'], correctIndex: 1, explanation: 'JOIN combines rows from multiple tables using a relationship condition: ON users.id = orders.user_id.', hint: 'Think of joining two spreadsheets based on a common ID column.' },
      { id: 'sql-e-3', topic: 'SQL', difficulty: 'Easy', question: 'What is the purpose of the WHERE clause?', options: ['To group results', 'To filter rows based on a condition before returning results', 'To sort results', 'To join tables'], correctIndex: 1, explanation: 'WHERE filters rows based on conditions: SELECT * FROM users WHERE age > 18 returns only users older than 18.', hint: 'WHERE filters which rows are included in the result.' },
    ],
    medium: [
      { id: 'sql-m-1', topic: 'SQL', difficulty: 'Medium', question: 'What is the difference between WHERE and HAVING?', options: ['They are identical', 'WHERE filters rows before grouping; HAVING filters groups after GROUP BY aggregation', 'HAVING works on individual rows', 'WHERE is for JOINs only'], correctIndex: 1, explanation: 'WHERE filters individual rows before aggregation. HAVING filters GROUP BY results — aggregate functions like COUNT() work in HAVING but not WHERE.', hint: 'WHERE comes before GROUP BY; HAVING comes after.' },
    ],
    hard: [
      { id: 'sql-h-1', topic: 'SQL', difficulty: 'Hard', question: 'What is a database index and what is the trade-off between query speed and write performance?', options: ['Indexes always improve both read and write performance', 'Indexes are B-tree structures that speed up reads but slow down INSERT/UPDATE/DELETE because the index must be updated alongside the table', 'Indexes are temporary', 'Indexes only work on primary keys'], correctIndex: 1, explanation: 'Indexes trade write overhead for read speed. Each index must be updated on every write. Too many indexes degrade write performance.', hint: "What happens to a book's index when you add new content pages?" },
    ]
  },

  'cybersecurity': {
    easy: [
      { id: 'cs-e-1', topic: 'Cybersecurity', difficulty: 'Easy', question: 'What is phishing?', options: ['A method to catch network packets', 'A social engineering attack where attackers impersonate trusted entities to steal sensitive information', 'A type of firewall configuration', 'A secure encryption protocol'], correctIndex: 1, explanation: 'Phishing tricks users into revealing credentials by impersonating legitimate organizations through fake emails, websites, or messages.', hint: 'Like fishing — you cast a lure (fake email) hoping someone takes the bait.' },
    ],
    medium: [
      { id: 'cs-m-1', topic: 'Cybersecurity', difficulty: 'Medium', question: 'What is the difference between symmetric and asymmetric encryption?', options: ['Symmetric is slower; asymmetric is faster', 'Symmetric uses the same key for encryption and decryption; asymmetric uses a public key to encrypt and private key to decrypt', 'Asymmetric uses the same key for both', 'Symmetric requires two different keys'], correctIndex: 1, explanation: 'Symmetric encryption (AES) uses one shared key — fast but requires secure key exchange. Asymmetric (RSA) uses a public/private key pair for secure exchange and digital signatures.', hint: 'HTTPS uses asymmetric to exchange keys, then symmetric for data.' },
    ],
    hard: [
      { id: 'cs-h-1', topic: 'Cybersecurity', difficulty: 'Hard', question: 'How does SQL injection work and what is the most effective prevention?', options: ['Prevented by HTTPS', 'Attackers inject malicious SQL via user input to manipulate database queries. Prevention: parameterized queries separate SQL code from data', 'SQL injection only affects NoSQL databases', 'Firewalls alone prevent it'], correctIndex: 1, explanation: 'SQL injection exploits applications that build queries by concatenating user input. Parameterized queries treat user input as data, never as executable SQL code.', hint: "Why do parameterized queries work where input escaping sometimes fails?" },
    ]
  },

  'docker': {
    easy: [
      { id: 'dk-e-1', topic: 'Docker', difficulty: 'Easy', question: 'What is a Docker container?', options: ['A physical server', 'A lightweight, portable, self-contained environment that packages an application with all its dependencies', 'A virtual machine with a full OS', 'A Docker configuration file'], correctIndex: 1, explanation: 'Containers package code, runtime, libraries, and configuration into a single portable unit that runs consistently across any environment.', hint: 'Containers vs VMs: containers share the host OS kernel; VMs have their own OS.' },
    ],
    medium: [
      { id: 'dk-m-1', topic: 'Docker', difficulty: 'Medium', question: 'What is the difference between a Docker Image and a Container?', options: ['They are identical', 'An image is a read-only immutable template; a container is a running instance of an image with a writable layer', 'A container is the template; an image is the running instance', 'Images are in memory; containers on disk'], correctIndex: 1, explanation: 'A Docker Image is a static blueprint (layered filesystem). A Container is a running instance adding a thin writable layer. Multiple containers can share one image.', hint: 'Think of an image as a class definition and a container as an object instance.' },
    ],
    hard: [
      { id: 'dk-h-1', topic: 'Docker', difficulty: 'Hard', question: 'What are Docker multi-stage builds and how do they reduce image size?', options: ['Multi-stage builds run multiple containers simultaneously', 'Multiple FROM instructions allow build/compile stages in temporary images; only the final stage copies the compiled binary — excluding build tools and source code from the production image', 'Multi-stage builds only work with Docker Compose', 'They increase security but increase image size'], correctIndex: 1, explanation: 'Multi-stage builds use large build images to produce artifacts, then copy only the final binary into a minimal base image (e.g., alpine), dramatically reducing attack surface and size.', hint: 'Why include a Go compiler in your production image when you only need the binary?' },
    ]
  },

  'system design': {
    easy: [
      { id: 'sd-e-1', topic: 'System Design', difficulty: 'Easy', question: 'What is the purpose of a load balancer?', options: ['To store user session data', 'To distribute incoming network traffic across multiple servers to prevent overload and improve availability', 'To compress database queries', 'To encrypt API requests'], correctIndex: 1, explanation: 'A load balancer distributes requests across a server pool using algorithms like round-robin or least connections — improving throughput and fault tolerance.', hint: 'If one server fails, the load balancer redirects traffic to healthy servers.' },
    ],
    medium: [
      { id: 'sd-m-1', topic: 'System Design', difficulty: 'Medium', question: 'What is database sharding and why is it used?', options: ['Sharding duplicates all data across servers', 'Sharding horizontally partitions data across multiple database servers based on a shard key, distributing storage and query load', 'Sharding is a read replica strategy', 'Sharding combines multiple databases into one'], correctIndex: 1, explanation: 'Sharding splits a large dataset across independent database nodes. Each shard holds a subset of data, enabling linear scaling of storage and write throughput.', hint: 'How does Instagram handle 100M users — one database cannot hold it all.' },
    ],
    hard: [
      { id: 'sd-h-1', topic: 'System Design', difficulty: 'Hard', question: 'How does consistent hashing prevent full cache redistribution when servers change?', options: ['Consistent hashing always rehashes all keys', 'Both servers and keys map onto a circular hash ring — adding/removing a server only redistributes the keys in the arc immediately before it, not all keys', 'Consistent hashing requires a central coordinator', 'It prevents sharding entirely'], correctIndex: 1, explanation: 'In a standard hash ring, adding a server only affects 1/n of total keys (those between the new server and its predecessor), versus traditional hashing which would redistribute all keys.', hint: 'Imagine a clock face with servers and keys placed by hash value.' },
    ]
  },

  'kubernetes': {
    easy: [
      { id: 'k8-e-1', topic: 'Kubernetes', difficulty: 'Easy', question: 'What is a Kubernetes Pod?', options: ['A physical server', 'The smallest deployable unit in Kubernetes — one or more containers sharing network and storage', 'A Kubernetes configuration file', 'A type of service'], correctIndex: 1, explanation: 'A Pod is the smallest deployable unit in Kubernetes. It wraps one or more containers that share network namespace and storage volumes.', hint: 'Pods are the atoms of Kubernetes — containers run inside them.' },
    ],
    medium: [
      { id: 'k8-m-1', topic: 'Kubernetes', difficulty: 'Medium', question: 'What is the difference between a Kubernetes Deployment and a StatefulSet?', options: ['They are identical', 'Deployments manage stateless apps with interchangeable pods; StatefulSets manage stateful apps with stable identity, ordered deployment, and persistent storage per pod', 'StatefulSets are for batch jobs', 'Deployments cannot scale'], correctIndex: 1, explanation: 'Deployments are ideal for stateless applications where pods are interchangeable. StatefulSets provide stable pod names, ordered scaling, and persistent volumes per pod — essential for databases like Cassandra.', hint: 'Would you use a Deployment or StatefulSet for a MySQL database?' },
    ],
    hard: [
      { id: 'k8-h-1', topic: 'Kubernetes', difficulty: 'Hard', question: 'How does Kubernetes horizontal pod autoscaling (HPA) work and what are its limitations?', options: ['HPA scales based on manually set schedules', 'HPA monitors metrics (CPU, memory, custom) via the metrics server and adjusts pod replica count automatically, but cannot scale faster than the metrics scrape interval and has min/max replica bounds', 'HPA requires manual triggering', 'HPA only works with StatefulSets'], correctIndex: 1, explanation: 'HPA continuously monitors resource metrics and scales replicas within defined min/max bounds. Limitations: scaling latency (metric collection + pod startup), cannot scale to zero (use KEDA), and cold start delays.', hint: 'What is the difference between HPA reaction time and actual traffic spike arrival?' },
    ]
  },
};

// Helper: find closest matching topic from the bank
const getTopicBank = (topic: string) => {
  const t = topic.toLowerCase();
  const keys = Object.keys(QUIZ_BANK);
  for (const key of keys) {
    if (t.includes(key)) return { key, bank: QUIZ_BANK[key] };
  }
  if (t.includes('cloud') || t.includes('aws') || t.includes('azure') || t.includes('gcp')) return { key: 'cloud computing', bank: QUIZ_BANK['cloud computing'] };
  if (t.includes('py') || t.includes('script') || t.includes('pandas') || t.includes('numpy')) return { key: 'python', bank: QUIZ_BANK['python'] };
  if (t.includes('ml') || t.includes('ai') || t.includes('learning') || t.includes('neural') || t.includes('model')) return { key: 'machine learning', bank: QUIZ_BANK['machine learning'] };
  if (t.includes('array') || t.includes('struct') || t.includes('algorithm') || t.includes('sort') || t.includes('tree') || t.includes('graph')) return { key: 'data structures', bank: QUIZ_BANK['data structures'] };
  if (t.includes('gpt') || t.includes('attention') || t.includes('llm') || t.includes('nlp') || t.includes('transformer')) return { key: 'transformer', bank: QUIZ_BANK['transformer'] };
  if (t.includes('database') || t.includes('query') || t.includes('table') || t.includes('sql')) return { key: 'sql', bank: QUIZ_BANK['sql'] };
  if (t.includes('security') || t.includes('hack') || t.includes('cyber') || t.includes('encrypt')) return { key: 'cybersecurity', bank: QUIZ_BANK['cybersecurity'] };
  if (t.includes('container') || t.includes('docker')) return { key: 'docker', bank: QUIZ_BANK['docker'] };
  if (t.includes('kubernetes') || t.includes('k8s') || t.includes('pod') || t.includes('helm')) return { key: 'kubernetes', bank: QUIZ_BANK['kubernetes'] };
  if (t.includes('design') || t.includes('architect') || t.includes('scale') || t.includes('load') || t.includes('shard')) return { key: 'system design', bank: QUIZ_BANK['system design'] };
  return { key: 'machine learning', bank: QUIZ_BANK['machine learning'] };
};

// Generate generic questions for topics not in the bank
const generateGenericQuestions = (topic: string, difficulty: 'Easy' | 'Medium' | 'Hard', count: number): QuizQuestion[] => {
  const templates = [
    { q: `What is the primary goal of ${topic}?`, opts: [`To understand the core principles of ${topic}`, `To avoid all forms of ${topic}`, `To replace ${topic} with older methods`, `None of the above`], correct: 0, exp: `${topic} is primarily focused on understanding and applying its core principles to solve real-world problems.`, hint: `Think about why people study ${topic} in the first place.` },
    { q: `Which best describes a key benefit of learning ${topic}?`, opts: [`It has no practical applications`, `It provides structured knowledge and problem-solving capabilities in the domain`, `It only applies to academic research`, `It is only useful for beginners`], correct: 1, exp: `Learning ${topic} equips practitioners with structured thinking and practical skills applicable across many domains.`, hint: `Consider the career opportunities it unlocks.` },
    { q: `What is the recommended first step when starting ${topic}?`, opts: [`Jump directly to advanced topics`, `Master foundational concepts and prerequisites before advancing`, `Skip theory and focus on practical exercises only`, `None of the above`], correct: 1, exp: `A strong foundation in core concepts is essential before advancing to complex topics in ${topic}.`, hint: `You would not build a house starting from the roof.` },
    { q: `In ${topic}, what does a "best practice" typically refer to?`, opts: [`Any random approach that works once`, `A proven method recommended by experts based on experience and results`, `The most complex available solution`, `The least documented approach`], correct: 1, exp: `Best practices in ${topic} are established through community consensus, research, and real-world validation.`, hint: `Best practices are learned from collective experience.` },
    { q: `How does hands-on practice contribute to mastering ${topic}?`, opts: [`It has no effect on learning`, `It reinforces theoretical understanding through practical application`, `It only benefits visual learners`, `Practice is less important than reading`], correct: 1, exp: `Hands-on practice converts theoretical knowledge into internalized skills through building, failing, and debugging.`, hint: `Why do medical students need clinical rotations alongside textbooks?` },
  ];
  return templates.slice(0, Math.min(count, templates.length)).map((t, i) => ({
    id: `gen-${topic.replace(/\s+/g, '-')}-${i}`,
    topic, difficulty,
    question: t.q, options: t.opts, correctIndex: t.correct, explanation: t.exp, hint: t.hint
  }));
};

export const assessmentMcp = {
  /**
   * Generate quiz questions for a topic with difficulty and count controls.
   */
  create_quiz: async (topic: string, difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium', count: number = 5): Promise<QuizQuestion[]> => {
    const { bank } = getTopicBank(topic);
    const diffKey = difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
    const pool = bank[diffKey] || [];
    const allPool = [...(bank['easy'] || []), ...(bank['medium'] || []), ...(bank['hard'] || [])];
    const sourcePool = pool.length >= count ? pool : allPool;
    const shuffled = [...sourcePool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, sourcePool.length));
    if (shuffled.length < count) {
      const generic = generateGenericQuestions(topic, difficulty, count - shuffled.length);
      return [...shuffled, ...generic];
    }
    return shuffled;
  },

  evaluate_answer: async (questionId: string, selectedIndex: number): Promise<{ correct: boolean; explanation: string }> => {
    return { correct: true, explanation: 'Mock evaluator: Valid answer input verified.' };
  },

  save_quiz_result: async (topic: string, score: number, total: number): Promise<{ saved: boolean }> => {
    return { saved: true };
  },

  get_badge: (score: number, total: number): 'master' | 'proficient' | 'learner' | 'retry' => {
    const pct = Math.round((score / total) * 100);
    if (pct >= 90) return 'master';
    if (pct >= 70) return 'proficient';
    if (pct >= 50) return 'learner';
    return 'retry';
  },

  get_available_topics: (): string[] => {
    return Object.keys(QUIZ_BANK).map(k => k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
  },
};

