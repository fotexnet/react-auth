import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import React from 'react';
import useImage from './useImage';

jest.mock('axios'); // Mock axios module

describe('useImage', () => {
  const url = 'https://example.com/image.jpg';
  let getSpy: jest.SpyInstance;

  const TestComponent = (): JSX.Element => {
    const imageUrl = useImage(url);
    return <div data-testid="image">{imageUrl}</div>;
  };

  beforeEach(() => {
    getSpy = jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve({ data: createTestBlob() }));
  });

  afterEach(() => {
    getSpy.mockRestore();
  });

  it('should fetch and return the data URL for the provided image URL', async () => {
    render(<TestComponent />);

    const node = await screen.findByTestId('image');

    await waitFor(() => {
      expect(node.textContent?.length).not.toEqual(0);
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(url, { responseType: 'blob', signal: new AbortController().signal });
  });
});

function createTestBlob(): Blob {
  const dataUrl = 'data:text/plain;base64,c2FtcGxlX2RhdGFfdGV4dA==';
  const data = Buffer.from(dataUrl.split(',')[1], 'base64');
  return new Blob([data], { type: 'text/plain' });
}
