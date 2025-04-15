import { expect, test, mock, spyOn } from "bun:test";
import { QueueFilter } from '@/components/queues/queue-filter';
import { apiGet } from '@/lib/api';

// Mock the API module
mock.module('@/lib/api', () => ({
  apiGet: mock.fn(() => Promise.resolve({ queues: [] })),
}));

// Mock the NewQueueDialog component
mock.module('@/components/new-queue-dialog', () => ({
  NewQueueDialog: ({ open }: { open: boolean }) => (
    open ? <div data-testid="new-queue-dialog">New Queue Dialog</div> : null
  ),
}));

// Test suite for QueueFilter component
test("QueueFilter - API integration", async () => {
  const mockQueues = [
    { id: 'queue1', name: 'Queue 1', description: 'Description 1' },
    { id: 'queue2', name: 'Queue 2', description: 'Description 2' },
  ];
  
  // Mock the API response
  apiGet.mockImplementation(() => Promise.resolve({ queues: mockQueues }));
  
  // Test that the API is called with the correct parameters
  const queueFilter = new QueueFilter({ accountPubkey: "test-pubkey" });
  
  // Verify API was called with correct parameters
  expect(apiGet).toHaveBeenCalledWith('/api/queues?accountPubkey=test-pubkey');
});

test("QueueFilter - Queue selection", async () => {
  const mockQueues = [
    { id: 'queue1', name: 'Queue 1', description: 'Description 1' },
    { id: 'queue2', name: 'Queue 2', description: 'Description 2' },
  ];
  
  // Mock the API response
  apiGet.mockImplementation(() => Promise.resolve({ queues: mockQueues }));
  
  // Test that the onQueueChange callback is called with the correct queue ID
  const onQueueChange = mock.fn();
  const queueFilter = new QueueFilter({
    accountPubkey: "test-pubkey",
    onQueueChange
  });
  
  // Simulate selecting a queue
  queueFilter.handleSelect('queue1');
  
  // Verify callback was called with correct queue ID
  expect(onQueueChange).toHaveBeenCalledWith('queue1');
});

test("QueueFilter - New Queue dialog", async () => {
  const mockQueues = [
    { id: 'queue1', name: 'Queue 1', description: 'Description 1' },
    { id: 'queue2', name: 'Queue 2', description: 'Description 2' },
  ];
  
  // Mock the API response
  apiGet.mockImplementation(() => Promise.resolve({ queues: mockQueues }));
  
  // Test that the new queue dialog is opened when "new" is selected
  const queueFilter = new QueueFilter({ accountPubkey: "test-pubkey" });
  
  // Spy on the setIsNewQueueDialogOpen method
  const setIsNewQueueDialogOpenSpy = spyOn(queueFilter, 'setIsNewQueueDialogOpen');
  
  // Simulate selecting "new"
  queueFilter.handleSelect('new');
  
  // Verify the dialog was opened
  expect(setIsNewQueueDialogOpenSpy).toHaveBeenCalledWith(true);
});

test("QueueFilter - No account pubkey", async () => {
  // Test that the API is not called when accountPubkey is not provided
  const queueFilter = new QueueFilter({});
  
  // Verify API was not called
  expect(apiGet).not.toHaveBeenCalled();
});