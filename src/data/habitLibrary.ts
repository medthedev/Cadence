import type { HabitColor } from '../types'

export const HABIT_CATEGORIES = [
  'Islamic',
  'Health',
  'Fitness',
  'Mindfulness',
  'Learning',
  'Productivity',
  'Lifestyle',
  'Home & Nature',
  'Finance',
  'Social & Giving',
] as const

export type HabitCategory = (typeof HABIT_CATEGORIES)[number]

export interface HabitTemplate {
  id: string
  name: string
  emoji: string
  color: HabitColor
  weeklyGoal: number
  category: HabitCategory
  description: string
}

type HabitTemplateSeed = Omit<HabitTemplate, 'id'>

const TEMPLATE_SEEDS: HabitTemplateSeed[] = [
  // Islamic
  { name: 'Pray five daily prayers on time', emoji: '🕌', color: 'emerald', weeklyGoal: 7, category: 'Islamic', description: 'Establish Salah at its appointed times.' },
  { name: 'Pray Fajr before sunrise', emoji: '🌅', color: 'emerald', weeklyGoal: 7, category: 'Islamic', description: 'Begin the day with the dawn prayer.' },
  { name: 'Recite Quran', emoji: '📖', color: 'emerald', weeklyGoal: 7, category: 'Islamic', description: 'Read at least a short portion daily.' },
  { name: 'Memorize Quran verses', emoji: '📜', color: 'violet', weeklyGoal: 5, category: 'Islamic', description: 'Review and build your hifdh.' },
  { name: 'Morning adhkar', emoji: '☀️', color: 'amber', weeklyGoal: 7, category: 'Islamic', description: 'Start the morning with remembrance.' },
  { name: 'Evening dhikr', emoji: '🌙', color: 'violet', weeklyGoal: 7, category: 'Islamic', description: 'Close the day with remembrance.' },
  { name: 'Say Istighfar 100 times', emoji: '🤲', color: 'emerald', weeklyGoal: 7, category: 'Islamic', description: 'Seek forgiveness throughout the day.' },
  { name: 'Send salawat upon the Prophet ﷺ', emoji: '💛', color: 'amber', weeklyGoal: 7, category: 'Islamic', description: 'Pray for the Prophet Muhammad ﷺ.' },
  { name: 'Make a personal du\'a', emoji: '🤲', color: 'violet', weeklyGoal: 5, category: 'Islamic', description: 'Spend a few minutes in sincere supplication.' },
  { name: 'Read hadith', emoji: '📚', color: 'violet', weeklyGoal: 5, category: 'Islamic', description: 'Learn from the Sunnah daily.' },
  { name: 'Fast on Mondays and Thursdays', emoji: '🌙', color: 'sky', weeklyGoal: 2, category: 'Islamic', description: 'The optional Sunnah fasts.' },
  { name: 'Give sadaqah', emoji: '💰', color: 'sky', weeklyGoal: 3, category: 'Islamic', description: 'Give a small amount regularly.' },
  { name: 'Pray Tahajjud', emoji: '✨', color: 'violet', weeklyGoal: 3, category: 'Islamic', description: 'Wake for the night prayer.' },
  { name: 'Pray in congregation', emoji: '🕌', color: 'emerald', weeklyGoal: 3, category: 'Islamic', description: 'Join the Jama\'ah when possible.' },
  { name: 'Use miswak', emoji: '🪥', color: 'sky', weeklyGoal: 7, category: 'Islamic', description: 'Follow the Sunnah of cleaning your teeth.' },
  { name: 'Visit or call family', emoji: '👨‍👩‍👧', color: 'rose', weeklyGoal: 3, category: 'Islamic', description: 'Maintain the ties of kinship.' },
  { name: 'Learn Arabic vocabulary', emoji: '🔤', color: 'amber', weeklyGoal: 5, category: 'Islamic', description: 'Understand the Quran a little more each day.' },
  { name: 'Listen to Quran recitation', emoji: '🎧', color: 'emerald', weeklyGoal: 5, category: 'Islamic', description: 'Listen with reflection.' },
  { name: 'Avoid backbiting', emoji: '🤐', color: 'rose', weeklyGoal: 7, category: 'Islamic', description: 'Guard your tongue and your heart.' },
  { name: 'Reflect on a tafsir', emoji: '📝', color: 'violet', weeklyGoal: 4, category: 'Islamic', description: 'Study the meaning of a passage.' },
  { name: 'Review zakat and charity', emoji: '💸', color: 'sky', weeklyGoal: 1, category: 'Islamic', description: 'Check your obligations each month.' },
  { name: 'Attend Jumu\'ah prayer', emoji: '🕌', color: 'emerald', weeklyGoal: 1, category: 'Islamic', description: 'Join the Friday congregational prayer.' },

  // Health
  { name: 'Drink eight glasses of water', emoji: '💧', color: 'sky', weeklyGoal: 7, category: 'Health', description: 'Stay hydrated through the day.' },
  { name: 'Take vitamins', emoji: '💊', color: 'sky', weeklyGoal: 7, category: 'Health', description: 'Keep up with your supplements.' },
  { name: 'Eat five servings of fruit and veg', emoji: '🥦', color: 'emerald', weeklyGoal: 7, category: 'Health', description: 'Colour your plate naturally.' },
  { name: 'Cook a home-cooked meal', emoji: '🍳', color: 'amber', weeklyGoal: 5, category: 'Health', description: 'Know what goes into your food.' },
  { name: 'Skip sugary drinks', emoji: '🚫', color: 'rose', weeklyGoal: 7, category: 'Health', description: 'Choose water or tea instead.' },
  { name: 'Sleep before 11 pm', emoji: '😴', color: 'violet', weeklyGoal: 7, category: 'Health', description: 'Protect a consistent bedtime.' },
  { name: 'Get eight hours of sleep', emoji: '🛏️', color: 'violet', weeklyGoal: 7, category: 'Health', description: 'Give your body time to recover.' },
  { name: 'Take a screen-free lunch break', emoji: '🍽️', color: 'amber', weeklyGoal: 5, category: 'Health', description: 'Actually step away from your desk.' },
  { name: 'Health check-in', emoji: '🩺', color: 'sky', weeklyGoal: 1, category: 'Health', description: 'Review sleep, energy and symptoms.' },
  { name: 'Floss teeth', emoji: '🪥', color: 'sky', weeklyGoal: 7, category: 'Health', description: 'A small daily investment.' },
  { name: 'Skincare routine', emoji: '🧴', color: 'rose', weeklyGoal: 7, category: 'Health', description: 'Morning and evening care.' },
  { name: 'Stretch after waking', emoji: '🤸', color: 'amber', weeklyGoal: 7, category: 'Health', description: 'Loosen up before the day begins.' },
  { name: 'Hydrate before coffee', emoji: '☕', color: 'sky', weeklyGoal: 7, category: 'Health', description: 'Water first, caffeine second.' },
  { name: 'Eat breakfast', emoji: '🥣', color: 'amber', weeklyGoal: 7, category: 'Health', description: 'Fuel your morning properly.' },
  { name: 'Prepare a healthy snack', emoji: '🥜', color: 'emerald', weeklyGoal: 5, category: 'Health', description: 'Avoid the vending machine.' },
  { name: 'Take medication on time', emoji: '💊', color: 'sky', weeklyGoal: 7, category: 'Health', description: 'Stay consistent with prescriptions.' },

  // Fitness
  { name: 'Morning workout', emoji: '💪', color: 'amber', weeklyGoal: 3, category: 'Fitness', description: 'Move before the day takes over.' },
  { name: 'Walk 10,000 steps', emoji: '👟', color: 'emerald', weeklyGoal: 7, category: 'Fitness', description: 'Keep your daily step goal.' },
  { name: 'Go for a run', emoji: '🏃', color: 'amber', weeklyGoal: 3, category: 'Fitness', description: 'Build your endurance.' },
  { name: 'Cycling session', emoji: '🚴', color: 'amber', weeklyGoal: 3, category: 'Fitness', description: 'Low-impact cardio outdoors.' },
  { name: 'Strength training', emoji: '🏋️', color: 'amber', weeklyGoal: 3, category: 'Fitness', description: 'Build and maintain muscle.' },
  { name: 'Yoga session', emoji: '🧘', color: 'violet', weeklyGoal: 4, category: 'Fitness', description: 'Strength, balance and flexibility.' },
  { name: 'Pilates', emoji: '🤸', color: 'violet', weeklyGoal: 3, category: 'Fitness', description: 'Control and core strength.' },
  { name: 'Swimming', emoji: '🏊', color: 'sky', weeklyGoal: 2, category: 'Fitness', description: 'A full-body, joint-friendly workout.' },
  { name: 'Walk after meals', emoji: '🚶', color: 'emerald', weeklyGoal: 7, category: 'Fitness', description: 'A gentle post-meal walk.' },
  { name: 'Take the stairs', emoji: '🪜', color: 'emerald', weeklyGoal: 7, category: 'Fitness', description: 'Make everyday movement count.' },
  { name: 'Core workout', emoji: '🔥', color: 'amber', weeklyGoal: 4, category: 'Fitness', description: 'Strengthen your core.' },
  { name: 'Posture check', emoji: '🪑', color: 'sky', weeklyGoal: 7, category: 'Fitness', description: 'Sit tall and reset your shoulders.' },
  { name: 'Evening stroll', emoji: '🌆', color: 'emerald', weeklyGoal: 5, category: 'Fitness', description: 'Unwind with a slow walk.' },
  { name: 'Warm-up and cool-down', emoji: '🤸', color: 'amber', weeklyGoal: 5, category: 'Fitness', description: 'Prepare your body and recover well.' },
  { name: 'Go hiking', emoji: '🌲', color: 'emerald', weeklyGoal: 1, category: 'Fitness', description: 'Fresh air and a real challenge.' },
  { name: 'Dance for 15 minutes', emoji: '💃', color: 'rose', weeklyGoal: 4, category: 'Fitness', description: 'Cardio that feels like fun.' },

  // Mindfulness
  { name: 'Meditate 10 minutes', emoji: '🧘', color: 'violet', weeklyGoal: 7, category: 'Mindfulness', description: 'Sit with your breath.' },
  { name: 'Deep breathing exercises', emoji: '🌬️', color: 'sky', weeklyGoal: 7, category: 'Mindfulness', description: 'Calm your nervous system.' },
  { name: 'Journal gratitude', emoji: '📔', color: 'rose', weeklyGoal: 7, category: 'Mindfulness', description: 'Write three things you are grateful for.' },
  { name: 'Mindful minute', emoji: '🧘', color: 'violet', weeklyGoal: 7, category: 'Mindfulness', description: 'One full minute of presence.' },
  { name: 'Digital detox hour', emoji: '📵', color: 'rose', weeklyGoal: 3, category: 'Mindfulness', description: 'Step away from all screens.' },
  { name: 'Screen-free morning', emoji: '🌅', color: 'amber', weeklyGoal: 5, category: 'Mindfulness', description: 'Do not check your phone on waking.' },
  { name: 'Reflect on the day', emoji: '🌙', color: 'violet', weeklyGoal: 7, category: 'Mindfulness', description: 'Review what went well and what did not.' },
  { name: 'Practice patience', emoji: '🧊', color: 'sky', weeklyGoal: 5, category: 'Mindfulness', description: 'Pause before reacting.' },
  { name: 'Positive affirmation', emoji: '💬', color: 'rose', weeklyGoal: 7, category: 'Mindfulness', description: 'Speak kindly to yourself.' },
  { name: 'Unplug before bed', emoji: '🔌', color: 'violet', weeklyGoal: 7, category: 'Mindfulness', description: 'No screens in the last hour.' },
  { name: 'Nature walk', emoji: '🌳', color: 'emerald', weeklyGoal: 3, category: 'Mindfulness', description: 'Get outside without a destination.' },
  { name: 'Listen to calm music', emoji: '🎵', color: 'violet', weeklyGoal: 5, category: 'Mindfulness', description: 'Make space for quiet.' },
  { name: 'Single-tasking', emoji: '🎯', color: 'amber', weeklyGoal: 7, category: 'Mindfulness', description: 'Do one thing at a time.' },
  { name: 'Take three mindful breaths', emoji: '😌', color: 'sky', weeklyGoal: 7, category: 'Mindfulness', description: 'Reset between tasks.' },

  // Learning
  { name: 'Read 20 minutes', emoji: '📚', color: 'violet', weeklyGoal: 7, category: 'Learning', description: 'Read something that stretches you.' },
  { name: 'Learn a new word', emoji: '📖', color: 'violet', weeklyGoal: 7, category: 'Learning', description: 'Grow your vocabulary.' },
  { name: 'Practice a language', emoji: '🗣️', color: 'sky', weeklyGoal: 5, category: 'Learning', description: 'Speak, listen, repeat.' },
  { name: 'Watch an educational video', emoji: '🎬', color: 'violet', weeklyGoal: 5, category: 'Learning', description: 'Learn something new in 15 minutes.' },
  { name: 'Take an online course', emoji: '💻', color: 'sky', weeklyGoal: 5, category: 'Learning', description: 'Make progress on a course.' },
  { name: 'Practice coding', emoji: '💻', color: 'amber', weeklyGoal: 5, category: 'Learning', description: 'Ship a little code every day.' },
  { name: 'Solve a puzzle', emoji: '🧩', color: 'amber', weeklyGoal: 5, category: 'Learning', description: 'Exercise your problem-solving.' },
  { name: 'Write a note or article', emoji: '✍️', color: 'violet', weeklyGoal: 4, category: 'Learning', description: 'Put your thoughts into words.' },
  { name: 'Listen to a podcast', emoji: '🎧', color: 'sky', weeklyGoal: 5, category: 'Learning', description: 'Learn on the move.' },
  { name: 'Review flashcards', emoji: '🗂️', color: 'amber', weeklyGoal: 7, category: 'Learning', description: 'Keep what you learned.' },
  { name: 'Study a chapter', emoji: '📖', color: 'violet', weeklyGoal: 5, category: 'Learning', description: 'Work through a book systematically.' },
  { name: 'Learn a recipe', emoji: '👩‍🍳', color: 'rose', weeklyGoal: 2, category: 'Learning', description: 'Add a new dish to your repertoire.' },
  { name: 'Practice an instrument', emoji: '🎸', color: 'rose', weeklyGoal: 5, category: 'Learning', description: 'Ten minutes of deliberate practice.' },
  { name: 'Visit a library', emoji: '📚', color: 'violet', weeklyGoal: 1, category: 'Learning', description: 'Browse the shelves without a plan.' },

  // Productivity
  { name: 'Plan the day in the morning', emoji: '🗓️', color: 'amber', weeklyGoal: 7, category: 'Productivity', description: 'Five minutes of intention.' },
  { name: 'Set three priorities', emoji: '🎯', color: 'amber', weeklyGoal: 7, category: 'Productivity', description: 'Know what matters most today.' },
  { name: 'Clear the inbox', emoji: '📥', color: 'sky', weeklyGoal: 5, category: 'Productivity', description: 'Triage and archive.' },
  { name: 'Reach inbox zero', emoji: '✉️', color: 'sky', weeklyGoal: 3, category: 'Productivity', description: 'Get to an empty inbox.' },
  { name: 'Break down a big task', emoji: '🧩', color: 'amber', weeklyGoal: 3, category: 'Productivity', description: 'Turn a project into next steps.' },
  { name: 'Review goals weekly', emoji: '📊', color: 'violet', weeklyGoal: 1, category: 'Productivity', description: 'Check your direction.' },
  { name: 'Weekly reflection', emoji: '📝', color: 'violet', weeklyGoal: 1, category: 'Productivity', description: 'What worked, what did not?' },
  { name: 'Time-block the day', emoji: '⏰', color: 'amber', weeklyGoal: 5, category: 'Productivity', description: 'Give every task a slot.' },
  { name: 'Pomodoro focus session', emoji: '🍅', color: 'emerald', weeklyGoal: 7, category: 'Productivity', description: 'One uninterrupted 25-minute block.' },
  { name: 'No-meeting morning', emoji: '🚫', color: 'amber', weeklyGoal: 3, category: 'Productivity', description: 'Protect your best hours.' },
  { name: 'Update the project board', emoji: '📋', color: 'sky', weeklyGoal: 5, category: 'Productivity', description: 'Keep your plans visible.' },
  { name: 'Prepare tomorrow tonight', emoji: '🌙', color: 'violet', weeklyGoal: 7, category: 'Productivity', description: 'Wake up knowing what to do.' },
  { name: 'Declutter the desktop', emoji: '🖥️', color: 'sky', weeklyGoal: 3, category: 'Productivity', description: 'A calm workspace, calm mind.' },
  { name: 'Backup important files', emoji: '💾', color: 'sky', weeklyGoal: 1, category: 'Productivity', description: 'Protect your work.' },

  // Lifestyle
  { name: 'Make the bed', emoji: '🛏️', color: 'amber', weeklyGoal: 7, category: 'Lifestyle', description: 'One small win before breakfast.' },
  { name: 'Morning stretch', emoji: '☀️', color: 'emerald', weeklyGoal: 7, category: 'Lifestyle', description: 'Wake up your body gently.' },
  { name: 'Cold shower', emoji: '🚿', color: 'sky', weeklyGoal: 4, category: 'Lifestyle', description: 'An invigorating start.' },
  { name: 'No phone in bed', emoji: '📵', color: 'rose', weeklyGoal: 7, category: 'Lifestyle', description: 'Keep the bedroom for rest.' },
  { name: 'Drink tea', emoji: '🍵', color: 'amber', weeklyGoal: 5, category: 'Lifestyle', description: 'Take a proper tea break.' },
  { name: 'Cook with family', emoji: '👨‍👩‍👧', color: 'rose', weeklyGoal: 3, category: 'Lifestyle', description: 'Make food a shared ritual.' },
  { name: 'Call a friend', emoji: '📞', color: 'rose', weeklyGoal: 3, category: 'Lifestyle', description: 'Maintain the connections you value.' },
  { name: 'Write a letter', emoji: '✉️', color: 'violet', weeklyGoal: 1, category: 'Lifestyle', description: 'Something handwritten, something personal.' },
  { name: 'Fix one small thing', emoji: '🔧', color: 'amber', weeklyGoal: 3, category: 'Lifestyle', description: 'A tiny repair or improvement.' },
  { name: 'Random act of kindness', emoji: '💛', color: 'rose', weeklyGoal: 4, category: 'Lifestyle', description: 'Make someone else\'s day.' },
  { name: 'Smile at a stranger', emoji: '😊', color: 'rose', weeklyGoal: 5, category: 'Lifestyle', description: 'A simple human connection.' },
  { name: 'Celebrate a small win', emoji: '🎉', color: 'amber', weeklyGoal: 7, category: 'Lifestyle', description: 'Acknowledge progress.' },

  // Home & Nature
  { name: 'Water the plants', emoji: '🌿', color: 'emerald', weeklyGoal: 3, category: 'Home & Nature', description: 'Keep your greenery alive.' },
  { name: 'Tidy the desk', emoji: '🧹', color: 'sky', weeklyGoal: 5, category: 'Home & Nature', description: 'Reset your workspace.' },
  { name: 'Do the dishes', emoji: '🍽️', color: 'amber', weeklyGoal: 7, category: 'Home & Nature', description: 'No sink of doom tomorrow.' },
  { name: 'Take out the trash', emoji: '🗑️', color: 'sky', weeklyGoal: 3, category: 'Home & Nature', description: 'Keep the home fresh.' },
  { name: 'Laundry day', emoji: '👕', color: 'amber', weeklyGoal: 2, category: 'Home & Nature', description: 'Wash, dry, fold, put away.' },
  { name: 'Clean the kitchen', emoji: '🧽', color: 'amber', weeklyGoal: 4, category: 'Home & Nature', description: 'A deeper wipe-down.' },
  { name: 'Open the windows', emoji: '🪟', color: 'sky', weeklyGoal: 7, category: 'Home & Nature', description: 'Let fresh air in.' },
  { name: 'Grow something', emoji: '🌱', color: 'emerald', weeklyGoal: 7, category: 'Home & Nature', description: 'Tend a seed, herb or seedling.' },
  { name: 'Pick up litter', emoji: '🌍', color: 'emerald', weeklyGoal: 2, category: 'Home & Nature', description: 'Leave a place cleaner than you found it.' },
  { name: 'Reduce single-use plastic', emoji: '♻️', color: 'emerald', weeklyGoal: 7, category: 'Home & Nature', description: 'Bring your own bottle and bag.' },
  { name: 'Meal plan for the week', emoji: '🍽️', color: 'amber', weeklyGoal: 1, category: 'Home & Nature', description: 'Decide once, eat well all week.' },
  { name: 'Prep a grocery list', emoji: '🛒', color: 'sky', weeklyGoal: 1, category: 'Home & Nature', description: 'Shop with intention.' },

  // Finance
  { name: 'Track expenses', emoji: '💸', color: 'sky', weeklyGoal: 7, category: 'Finance', description: 'Know where your money goes.' },
  { name: 'Save a small amount', emoji: '🪙', color: 'emerald', weeklyGoal: 7, category: 'Finance', description: 'Pay yourself first.' },
  { name: 'Review budget', emoji: '📊', color: 'sky', weeklyGoal: 1, category: 'Finance', description: 'A monthly money check-up.' },
  { name: 'Avoid impulse buying', emoji: '🛒', color: 'rose', weeklyGoal: 7, category: 'Finance', description: 'Wait 24 hours before you buy.' },
  { name: 'Pay a bill on time', emoji: '🧾', color: 'sky', weeklyGoal: 3, category: 'Finance', description: 'Stay ahead of due dates.' },
  { name: 'Read about investing', emoji: '📈', color: 'violet', weeklyGoal: 3, category: 'Finance', description: 'Build your financial literacy.' },
  { name: 'Cancel an unused subscription', emoji: '✂️', color: 'rose', weeklyGoal: 1, category: 'Finance', description: 'Trim what you never use.' },
  { name: 'Give a tip or donate', emoji: '💛', color: 'rose', weeklyGoal: 3, category: 'Finance', description: 'Support someone\'s work.' },

  // Social & Giving
  { name: 'Check in on a friend', emoji: '💬', color: 'rose', weeklyGoal: 3, category: 'Social & Giving', description: 'A message can mean a lot.' },
  { name: 'Write a thank-you note', emoji: '🙏', color: 'rose', weeklyGoal: 1, category: 'Social & Giving', description: 'Express your gratitude.' },
  { name: 'Volunteer time', emoji: '🤝', color: 'rose', weeklyGoal: 1, category: 'Social & Giving', description: 'Give where you can.' },
  { name: 'Visit family', emoji: '👪', color: 'rose', weeklyGoal: 2, category: 'Social & Giving', description: 'Be present with your people.' },
  { name: 'Compliment someone', emoji: '💬', color: 'rose', weeklyGoal: 7, category: 'Social & Giving', description: 'Say the kind thing out loud.' },
  { name: 'Help a neighbour', emoji: '🏠', color: 'amber', weeklyGoal: 3, category: 'Social & Giving', description: 'Small acts of neighbourliness.' },
  { name: 'Share a meal', emoji: '🍲', color: 'rose', weeklyGoal: 2, category: 'Social & Giving', description: 'Food brings people together.' },
  { name: 'Mentor someone', emoji: '🌱', color: 'violet', weeklyGoal: 1, category: 'Social & Giving', description: 'Pass on what you know.' },
]

export const HABIT_LIBRARY: HabitTemplate[] = TEMPLATE_SEEDS.map((template, index) => ({
  ...template,
  id: `habit-template-${index + 1}`,
}))
