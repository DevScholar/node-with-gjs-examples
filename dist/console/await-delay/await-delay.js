print('0s');
await new Promise(resolve => setTimeout(resolve, 1000));
print("1s");
await new Promise(resolve => setTimeout(resolve, 1000));
print("2s");
await new Promise(resolve => setTimeout(resolve, 1000));
print("3s");
export {};
