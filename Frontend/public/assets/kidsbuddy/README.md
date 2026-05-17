# KidsBuddy mascot GIFs

Place your mascot clips here (`.mp4` recommended, `.gif` also supported).

## Folder structure

```
public/assets/kidsbuddy/
  dog/
    happy.mp4   (or .gif)
    sad.mp4
    thinking.mp4
    motivation.mp4
    celebrating.mp4
    sleep.mp4
    alert.mp4
  cat/
    (same filenames)
```

## How to add GIFs

1. Copy your `.gif` files into `dog/` and/or `cat/` using the exact names above.
2. Restart the Vite dev server (`npm run dev`) if it is already running.
3. Open the patient dashboard — the KidsBuddy card will show the GIF for the current state.

If a file is missing, the UI falls back to `.mp4`, then 🐶 / 🐱 emoji.

## Quiz emotion mapping (Kids Pet Buddy)

| Answer tone | GIF state   |
|-------------|-------------|
| Yes         | `happy`     |
| A little    | `thinking`  |
| Not yet     | `sad`       |
| Quiz done (high score) | `celebrating` |
| Quiz done (mid score)  | `happy` or `motivation` |

## Tips

- Keep each GIF under ~2MB for fast loading.
- **9:16 portrait** is supported — the dashboard frame uses the same ratio.
- Width ~360–720px is a good export size for vertical clips.
