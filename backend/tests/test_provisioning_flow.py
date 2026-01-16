import pytest
from unittest.mock import AsyncMock, patch
from backend.services.provisioning import ProvisioningService, OSType
from backend.providers.os_catalog import OS_CATALOG

# Mocking the providers to avoid actual API calls
@pytest.fixture
def mock_provisioning_service():
    with patch('backend.services.provisioning.VultrProvider') as MockVultr, \
         patch('backend.services.provisioning.ContaboProvider') as MockContabo:
        
        service = ProvisioningService()
        service.vultr = MockVultr.return_value
        service.contabo = MockContabo.return_value
        
        # Setup async mocks
        service.vultr.create_windows_instance = AsyncMock(return_value={"id": "win-mock", "ip": "1.1.1.1"})
        service.contabo.create_linux_instance = AsyncMock(return_value={"id": "lin-mock", "ip": "2.2.2.2"})
        
        yield service

@pytest.mark.asyncio
async def test_provision_rdp_windows_default(mock_provisioning_service):
    """Test standard Windows provisioning without specific OS ID"""
    result = await mock_provisioning_service.provision_rdp(
        order_id="ord-win-1",
        os_type=OSType.WINDOWS,
        plan="basic",
        location="US"
    )
    
    mock_provisioning_service.vultr.create_windows_instance.assert_called_once()
    # verify default os_id 477 was used
    call_kwargs = mock_provisioning_service.vultr.create_windows_instance.call_args.kwargs
    assert call_kwargs['os_id'] == 477
    assert result['id'] == "win-mock"

@pytest.mark.asyncio
async def test_provision_rdp_linux_with_ssh_keys(mock_provisioning_service):
    """Test Linux provisioning with SSH keys passing"""
    ssh_keys = [101, 102]
    result = await mock_provisioning_service.provision_rdp(
        order_id="ord-lin-1",
        os_type=OSType.LINUX,
        plan="pro",
        location="EU",
        ssh_key_ids=ssh_keys
    )
    
    mock_provisioning_service.contabo.create_linux_instance.assert_called_once()
    call_kwargs = mock_provisioning_service.contabo.create_linux_instance.call_args.kwargs
    assert call_kwargs['ssh_keys'] == ssh_keys
    assert call_kwargs['image_id'] == "ubuntu-22.04" # Default
    assert result['id'] == "lin-mock"

@pytest.mark.asyncio
async def test_provision_rdp_specific_os_resolution(mock_provisioning_service):
    """Test that os_specific_id is correctly resolved from catalog"""
    # Find a windows item from catalog to test
    target_item = next((i for i in OS_CATALOG if i.type == "windows"), None)
    if not target_item:
        pytest.skip("No windows items in catalog to test")

    result = await mock_provisioning_service.provision_rdp(
        order_id="ord-win-custom",
        os_type=OSType.WINDOWS,
        plan="basic",
        location="Asia",
        os_specific_id=target_item.id
    )
    
    msg = f"Failed for {target_item.name}"
    mock_provisioning_service.vultr.create_windows_instance.assert_called_once()
    call_kwargs = mock_provisioning_service.vultr.create_windows_instance.call_args.kwargs
    assert call_kwargs['os_id'] == target_item.provider_os_id, msg
