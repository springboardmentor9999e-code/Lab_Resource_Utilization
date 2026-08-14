package com.example.hello.service;
import org.springframework.data.domain.Sort;
import com.example.hello.entity.Category;
import com.example.hello.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository repository;

    public List<Category> getAllCategories() {
        return repository.findAll(Sort.by("categoryId"));
    }

    public Category saveCategory(Category category) {
        return repository.save(category);
    }

    public Category getCategoryById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteCategory(Integer id) {
        repository.deleteById(id);
    }
}