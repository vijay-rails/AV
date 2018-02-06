export function toList(data) {
  return data.feed.entry.reduce((list, entry) => {
    const entryKeys = Object.keys(entry).filter((entryKey) => entryKey.indexOf('gsx$') === 0);
    list.push(entryKeys.reduce((state, key) => {
      state[key.substring(4, key.length)] = entry[key].$t;
      return state;
    }, {}));
    return list;
  }, []);
}

export function toObject(data) {
  return toList(data)[0];
}
