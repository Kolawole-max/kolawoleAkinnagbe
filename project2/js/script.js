$(window).on('load', function () {
  $('#preloader').show();                                                               

  $('#refreshBtn').click(function(e){
    e.preventDefault();
    reload();
  }) 

  $.ajax({
    url: 'php/getAllLocation.php',
    type: 'GET',
    dataType: 'json',
    success: function(results) {
      var list = results.data.map(result => {
        return `<li class="list" data-id=${result.id}>${result.name}</li>`
      }).join('');
      $('#locationList').append(list);

      $('#locationList li').click(function(e){

        e.preventDefault();
        var id = $(this).attr("data-id");

        $.ajax({
          url: 'php/getAllByLocationID.php',
          type: 'POST',
          dataType: 'json',
          data: {id: id},
          success: function(results) {
            addDataToListPersonnel(results);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus)
          }
        });

      })
      
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus)
    }
  });

  $.ajax({
    url: 'php/getAllDepartments.php',
    type: 'GET',
    dataType: 'json',
    success: function(results) {
      var list = results.data.map(result => {
        return `<li class="list" data-id=${result.id}>${result.name}</li>`
      }).join('');
      $('#departmentList').append(list);

      $('#departmentList li').click(function(e){
        e.preventDefault();
        var id = $(this).attr("data-id");

        $.ajax({
          url: 'php/getAllByDepartmentID.php',
          type: 'POST',
          dataType: 'json',
          data: {id: id},
          success: function(results) {
            addDataToListPersonnel(results);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus)
          }
        });

      })
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus)
    }
  });


  loadDepartmentsTable();
  loadLocationTable();
  loadTableData();

  //Search bar action 
  $('#searchInput').on('input', function(){
    var text = $(this).val();

    if ($("#personnelBtn").hasClass("active")) {
    
      var searchResult = [];
      $.ajax({
        url: 'php/getAll.php',
        type: 'GET',
        dataType: 'json',
        success: function(results) {
          
          results.data.forEach(result => {
            var firstName = result.firstName.toLowerCase();
            var lastName = result.lastName.toLowerCase();
            var email = result.email.toLowerCase();
            if(result.department){
              var department = result.department.toLowerCase();
            } else {
              var department = ''
            }
            if(result.location){
              var location = result.location.toLowerCase();
            } else {
              var location = ''
            }
            
            
            if(firstName.includes(text.toLowerCase()) || lastName.includes(text.toLowerCase()) || email.includes(text.toLowerCase()) ||
                 department.includes(text.toLowerCase()) || location.includes(text.toLowerCase())){
              searchResult.push(result);
            }
          })
          const finalResult = { data: searchResult };
          addDataToListPersonnel(finalResult);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(errorThrown)
        }
      });
      
    } else {
      
      if ($("#departmentsBtn").hasClass("active")) {
        
        var searchResult = [];
        $.ajax({
          url: 'php/getAllDepartments.php',
          type: 'GET',
          dataType: 'json',
          success: function(results) {
            
            results.data.forEach(result => {
              
              var name = result.name.toLowerCase();
              var location = result.location.toLowerCase();
                            
              if(name.includes(text.toLowerCase()) || location.includes(text.toLowerCase())){
                searchResult.push(result);
              }
            })
            const finalResult = { data: searchResult };
            addDepartmentsDataToList(finalResult);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown)
          }
        });
        
      } else {
        
        var searchResult = [];
        $.ajax({
          url: 'php/getAllLocation.php',
          type: 'GET',
          dataType: 'json',
          success: function(results) {
            
            results.data.forEach(result => {
              
              var name = result.name.toLowerCase();
                            
              if(name.includes(text.toLowerCase())){
                searchResult.push(result);
              }
            })
            const finalResult = { data: searchResult };
            addLocationDataToList(finalResult);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown)
          }
        });        
      }
      
    }
  })


  //Edit Personnel submit form 
  $('#editPersonnelform').submit(function(event){
    event.preventDefault();
    var personnelID = $(this).attr("data-id")

    var firstName = $('#editFirstname').val();
    var lastName = $('#editLastname').val();
    var email = $('#editEmail').val();
    var jobTitle = $('#editJob').val();
    var departmentId = $('#editDepartment').val();

    $.ajax({
      url: 'php/editPersonnelByID.php',
      type: 'POST',
      dataType: 'json',
      data: {firstName: firstName,
              lastName: lastName,
              email: email,
              jobTitle: jobTitle,
              departmentID: departmentId,
              id: personnelID},
      success: function(result) {
        $('#editPersonnelModal').modal('hide');
        reload();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus)
      }
    });
  })


  //Delete personnel confirm button
  $('#deletePersonnelConfirmBtn').click(function(){
    var personnelID = $(this).attr("data-id");

    $.ajax({
      url: 'php/deletePersonnelByID.php',
      type: 'POST',
      dataType: 'json',
      data: {id: personnelID},
      success: function(result) {
        $('#deletePersonnelModal').modal('hide');
        reload();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus)
      }
    });
  })

  //Add new personnel  button  
  $('#addNewEmployee').click(function(){
    $('#addPersonnelModal').modal('show');

    $('#firstname').val('');
    $('#lastname').val('');
    $('#email').val('')
    $('#job').val('');
    $('#department').text('');

    var depts = fetchDepartments();

    depts.then(function(result){
      var options = [];
      $.each(result.data, function(index, data) {
        options.push(data);
      });

      options.sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });

      $.each(options, function(index, data) {
        var deptOption = $('<option>', {
          value: data.id, 
        text: data.name
        });
        $('#department').append(deptOption);
      });
    })
  })

  $('#addNewPersonnelCancelBtn').click(function(){
    $('#addPersonnelModal').modal('hide');
  })

  //Add new personnel form
  $('#addNewPersonnelform').submit(function(event){
    event.preventDefault();

    var firstName = $('#firstname').val();
    var lastName = $('#lastname').val();
    var email = $('#email').val();
    var jobTitle = $('#job').val();
    var departmentId = $('#department').val();

    $.ajax({
      url: 'php/insertPersonnel.php',
      type: 'POST',
      dataType: 'json',
      data: {firstName: firstName,
              lastName: lastName,
              email: email,
              jobTitle: jobTitle,
              departmentID: departmentId},
      success: function(result) {
        $('#addPersonnelModal').modal('hide');
        reload();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    });
  })
  

  //Delete confirm button for delete department
  $('#deleteDepartmentConfirmBtn').click(function() { //confirmDeleteDepartment.php
    var id = $(this).attr("data-id");

    $.ajax({
      url: 'php/deleteDepartmentByID.php',
      type: 'POST',
      dataType: 'json',
      data: {id : id}, 
      success: function(result) {
        $('#deleteDepartmentModal').modal('hide');
        reload();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus)
      }
    });
  })

  //Edit department form 
  $('#editDepartmentform').submit(function(event) {
    event.preventDefault();

    var department_id = $(this).attr("data-id");

    var location = $('#editDepartmentLocation').val()
    var name = $('#editDepartmentName').val();

    $.ajax({
      url: 'php/editDepartmentById.php',
      type: 'POST',
      dataType: 'json',
      data: {
        id: department_id,
        locationdID: location,
        name: name
      },
      success: function(result) {
        $('#editDepartmentModal').modal('hide')
        reload();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    });
  })

  //Add new department btn
  $('.addNewDepartmentBtn').click(function(){

    $('#addDepartmentModal').modal('show')
    $('#departmentName').val('');
    $('#departmentLocation').val('');

    $.ajax({
      url: 'php/getAllLocation.php',
      type: 'GET',
      dataType: 'json',
      success: function(results) {
        results.data.forEach(element => {
          var locationOption = $('<option>', {
            value: element.id, 
            text: element.name
          });
          $('#departmentLocation').append(locationOption);
        })
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown)
      }
    });
  })

  //Add new Department
  $('#addNewDepartmentform').submit(function(event) {
    event.preventDefault();

    var name = $('#departmentName').val();
    var location = $('#departmentLocation').val();

    $.ajax({
      url: 'php/insertDepartment.php',
      type: 'POST',
      dataType: 'json',
      data: {
        locationID: location,
        name: name
      },
      success: function(result) {
        $('#addDepartmentModal').modal('hide')
        reload();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    });
  });

  //Delete confirm button for delete location
  $('#deleteLocationConfirmBtn').click(function() { //confirmDeleteDepartment.php
    var id = $(this).attr("data-id");

    $.ajax({
      url: 'php/deleteLocationById.php',
      type: 'POST',
      dataType: 'json',
      data: {id : id}, 
      success: function(result) {
        $('#deleteLocationModal').modal('hide');
        reload()
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus)
      }
    });
  })

  //Edit location form 
  $('#editLocationform').submit(function(event) {
    event.preventDefault();

    //$('#editLocationModal').modal('hide');
    var location_id = $(this).attr("data-id");

    var name = $('#editLocationName').val();

    $.ajax({
      url: 'php/editLocationById.php',
      type: 'POST',
      dataType: 'json',
      data: {
        id: location_id,
        name: name
      },
      success: function(result) {
        $('#editLocationModal').modal('hide')
        reload()
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    });
  })

  //Add new location btn 
  $('.addNewLocationBtn').click(function(e){
    e.preventDefault();
    $('#locationName').val('');
    $('#addLocationModal').modal('show');
  })
  

  //Add new location
  $('#addNewLocationform').submit(function(event) {
    event.preventDefault();

    var name = $('#locationName').val();

    $.ajax({
      url: 'php/insertLocation.php',
      type: 'POST',
      dataType: 'json',
      data: {
        name: name
      },
      success: function(result) {
        $('#addLocationModal').modal('hide')
        reload();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    });
  });

  $('#preloader').hide();
});

function reload(){
  $('#preloader').show();

  loadDepartmentsTable();
  loadLocationTable();
  loadTableData();

  //location.reload();
  
  $('#preloader').hide();
}

function loadLocationTable(){

  $.ajax({
    url: 'php/getAllLocation.php',
    type: 'GET',
    dataType: 'json',
    success: function(results) {
      addLocationDataToList(results)
      //alert(message);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(errorThrown)
    }
  });
}

function addLocationDataToList(results){
  $('#locationTable').text('');

  var tableRow = results.data.map(result => {
    return ` <tr data-id="${result.id}">
        <td class="align-middle text-nowrap">
          ${result.name}
        </td>
        <td class="align-middle text-end text-nowrap">
          <button type="button" class="btn btn-primary btn-sm" data-id="${result.id}"> 
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
          <button  type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${result.id}">
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button>
        </td>
      </tr> `
  }).join('');
  $('#locationTable').append(tableRow);

  //Delete department button
  $('#locationTable tr td button:nth-child(1)').click(function(){ 

    var location_id = $(this).attr("data-id");

    $.ajax({
      url: 'php/confirmDeleteLocation.php',
      type: 'POST',
      dataType: 'json',
      data: {id: location_id}, 
      success: function(results) {
        $.each(results.data, function(index, data){
          
          if(parseInt(data.department) > 0){

            $('#warningLocationName').text(data.name)
            $('#deleteWarningLocationModal').modal('show');

          } else {
            $('#confirmDeleteLocationName').text(data.name);
            $('#deleteLocationConfirmBtn').attr('data-id', location_id)
            $('#deleteLocationModal').modal('show');
            
          }
        })
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus)
      }
    });
    
  })


  //Edit location button
  $('#locationTable tr td button:nth-child(2)').click(function() {

    var location_id = $(this).attr("data-id");
    $('#editLocationform').attr('data-id', location_id)

    $.ajax({
      url: 'php/getLocationById.php',
      type: 'POST',
      dataType: 'json',
      data: {id: location_id},
      success: function(results) {
        results.data.forEach(element => {
          $('#editLocationName').val(element.name);
        })
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown)
      }
    });
  });

  
}

function loadDepartmentsTable(){

  $.ajax({
    url: 'php/getAllDepartments.php',
    type: 'GET',
    dataType: 'json',
    success: function(results) {
      addDepartmentsDataToList(results)
      //alert(message);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(errorThrown)
    }
  });
}

function addDepartmentsDataToList(results){

  $('#departmentTable').text('');
  var departmentRow = results.data.map(result => {
    return ` <tr>
        <td class="align-middle text-nowrap">
          ${result.name}
        </td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">
        ${result.location}
        </td>
        <td class="align-middle text-end text-nowrap">
          <button type="button" class="btn btn-primary btn-sm" data-id="${result.id}"> 
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
          <button  type="button" class="btn btn-primary btn-sm" data-id="${result.id}">
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button>
        </td>
      </tr> `
  }).join('');
  $('#departmentTable').append(departmentRow);

  //Delete department button
  $('#departmentTable tr td button:nth-child(1)').click(function(){ 

    var department_id = $(this).attr("data-id");
    $.ajax({
      url: 'php/confirmDeleteDepartment.php',
      type: 'POST',
      dataType: 'json',
      data: {id: department_id}, 
      success: function(results) {
        $.each(results.data, function(index, data){
          
          if(parseInt(data.personnel) > 0){

            $('#warningDepartmentName').text(data.name)
            $('#deleteWarningDepartmentModal').modal('show');

          } else {
            $('#confirmDeleteDepartmentName').text(data.name);
            $('#deleteDepartmentModal').modal('show');

            $('#deleteDepartmentConfirmBtn').attr('data-id', department_id)
          }
        })
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus)
      }
    });
  })

  //Edit dept button
  $('#departmentTable tr td button:nth-child(2)').click(function() {

    var department_id = $(this).attr("data-id");
    $('#editDepartmentform').attr('data-id', department_id)
    $('#editDepartmentLocation').text('');

    $.ajax({
      url: 'php/getAllLocation.php',
      type: 'GET',
      dataType: 'json',
      success: function(results) {
        var options = [];
        $.each(results.data, function(index, data) {
          options.push(data);
          
        });
        options.sort(function(a, b) {
          return a.name.localeCompare(b.name);
        });
  
        $.each(options, function(index, data) {
          var deptOption = $('<option>', {
            value: data.id, 
            text: data.name
          });
          $('#editDepartmentLocation').append(deptOption);
        });
        $('#editDepartmentModal').modal('show');
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown)
      }
    });
    

    $.ajax({
      url: 'php/getDepartmentByID.php',
      type: 'POST',
      dataType: 'json',
      data: {id: department_id},
      success: function(results) {
        console.log(results);
        results.data.forEach(element => {
          $('#editDepartmentLocation').val(element.locationID).change();
          $('#editDepartmentName').val(element.name);
        })
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown)
      }
    });
  });

  
}

function fetchDepartments(){
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: 'php/getAllDepartments.php',
      type: 'GET',
      dataType: 'json',
      success: function(result) {
        resolve(result);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        reject(errorThrown)
      }
    });
  })
}

function loadTableData(){
  
  $.ajax({
    url: 'php/getAll.php',
    type: 'GET',
    dataType: 'json',
    success: function(result) {
      addDataToListPersonnel(result);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus)
    }
  });
}

function addDataToListPersonnel(result){
  $('#personal').text('');

  var personal = result.data.map(element => {
    return ` <tr data-id="${element.id}>
          <td class="align-middle text-nowrap">
            ${element.firstName}
          </td>
          <td class="align-middle text-nowrap">
            ${element.lastName}
          </td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">
          ${element.firstName}
          </td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">
          ${element.email}
          </td>
          <td class="align-middle text-nowrap d-none d-lg-table-cell">
          ${element.department}
          </td>
          <td class="align-middle text-end text-nowrap">
            <button type="button" class="btn btn-primary btn-sm" data-id="${element.id}" data-firstname="${element.firstName}" data-lastname="${element.lastName}"> 
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
            <button  type="button" class="btn btn-primary btn-sm" data-id="${element.id}">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
          </td>
        </tr> `
  }).join('');
  $('#personal').append(personal)


  $('#personal tr td button:nth-child(1)').click(function(){
    const id = $(this).attr('data-id');
    const firstName = $(this).attr('data-firstname');
    const lastName = $(this).attr('data-lastname');

    $('#deletePersonnelConfirmBtn').attr('data-id', id);

    $('#deletePersonelFirstName').text(firstName);
    $('#deletePersonelLastName').text(lastName);
    $('#deletePersonnelModal').modal('show');
  })

  $('#personal tr td button:nth-child(2)').click(function(){
    
    $('#editPersonnelModal').modal('show');
    $('#editDepartment').text('');

    var personnelID = $(this).attr("data-id")
    $('#editPersonnelform').attr('data-id', personnelID);

    var depts = fetchDepartments();

    depts.then(function(result){
      var options = [];
      $.each(result.data, function(index, data) {
        options.push(data);        
      });

      options.sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });

      $.each(options, function(index, data) {
        var deptOption = $('<option>', {
          value: data.id, 
        text: data.name
        });
        $('#editDepartment').append(deptOption);
      });
    })
    

    $.ajax({
      url: 'php/getPersonnelByID.php',
      type: 'POST',
      dataType: 'json',
      data:{id: personnelID},
      success: function(result) {
        var departmentId;
        $.each(result.data, function(index, element) {
          $('#editFirstname').val(element.firstName);
          $('#editLastname').val(element.lastName);
          $('#editEmail').val(element.email);
          $('#editJob').val(element.jobTitle);
          departmentId = element.departmentID;
        })
        $('#editDepartment').val(departmentId).change();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown)
      }
    });
  })
}

function fetchResultFromPhp(fileName, data){
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: fileName,
      type: 'GET',
      dataType: 'json',
      data: data,
      success: function(result) {
        resolve(result);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        reject(errorThrown);
      }
    });
  });
}
