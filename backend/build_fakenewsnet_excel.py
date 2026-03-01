import os
import pandas as pd
from sklearn.model_selection import train_test_split

# 🔹 Your dataset path
DATASET_PATH = r"D:\FISAT\S4\MAIN PROJECT\FakeNewsNet-master\dataset"

files = [
    ("gossipcop_fake.csv", 1),
    ("gossipcop_real.csv", 0),
    ("politifact_fake.csv", 1),
    ("politifact_real.csv", 0),
]

dataframes = []

print("Loading CSV files...\n")

for filename, label in files:
    file_path = os.path.join(DATASET_PATH, filename)

    print(f"Reading {filename}...")
    df = pd.read_csv(file_path)

    print("Columns found:", df.columns.tolist())

    if "title" not in df.columns:
        raise Exception(f"'title' column not found in {filename}")

    df = df[["title"]].copy()
    df.rename(columns={"title": "text"}, inplace=True)
    df["label"] = label

    # Remove very short headlines
    df = df[df["text"].astype(str).str.len() > 10]

    dataframes.append(df)

# Combine all datasets
full_df = pd.concat(dataframes, ignore_index=True)

print("\nBefore balancing:")
print(full_df["label"].value_counts())

# 🔹 Balance dataset (undersample majority class)
fake_df = full_df[full_df["label"] == 1]
real_df = full_df[full_df["label"] == 0]

real_df = real_df.sample(len(fake_df), random_state=42)

balanced_df = pd.concat([fake_df, real_df], ignore_index=True)

print("\nAfter balancing:")
print(balanced_df["label"].value_counts())

# Shuffle
balanced_df = balanced_df.sample(frac=1, random_state=42).reset_index(drop=True)

# 🔹 Stratified split
train_df, test_df = train_test_split(
    balanced_df,
    test_size=0.2,
    random_state=42,
    stratify=balanced_df["label"]
)

print("\nTrain distribution:")
print(train_df["label"].value_counts())

print("\nTest distribution:")
print(test_df["label"].value_counts())

# Save CSV files
train_df.to_csv("train_fnn.csv", index=False)
test_df.to_csv("test_fnn.csv", index=False)

print("\n✅ Dataset built successfully with balancing + stratified split!")
print("Files created:")
print(" - train_fnn.csv")
print(" - test_fnn.csv")