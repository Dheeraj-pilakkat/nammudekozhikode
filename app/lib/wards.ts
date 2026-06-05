export interface Ward {
  id: string;
  name: string;
  top: string;
  left: string;
}

export const DEFAULT_WARDS: Ward[] = [
  { id: 'Ward 12', name: 'Beach Road', top: '110px', left: '50px' },
  { id: 'Ward 4', name: 'Mananchira', top: '80px', left: '180px' },
  { id: 'Ward 18', name: 'Palayam', top: '190px', left: '130px' },
  { id: 'Ward 9', name: 'West Hill', top: '50px', left: '90px' }
];

export function generateRandomCoords() {
  const topVal = Math.floor(Math.random() * 180) + 40; // between 40px and 220px
  const leftVal = Math.floor(Math.random() * 180) + 40; // between 40px and 220px
  return {
    top: `${topVal}px`,
    left: `${leftVal}px`
  };
}
